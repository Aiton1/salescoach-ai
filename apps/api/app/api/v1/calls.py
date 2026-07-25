from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Body
from fastapi.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
import uuid
import json
import asyncio
import traceback

from app.schemas.schemas import (
    CallResponse,
    AnalysisResponse,
    DashboardStats,
)

router = APIRouter()

# In-memory storage
calls_db: dict[str, dict] = {}
analyses_db: dict[str, dict] = {}


async def _analyze(transcription: str) -> dict:
    from openai import AsyncOpenAI
    from app.core.config import get_settings
    settings = get_settings()

    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL,
    )

    prompt = (
        "Analiza esta llamada de ventas B2B. "
        "Responde SOLO con este JSON (sin markdown):\n"
        '{"summary":"resumen 2 oraciones","overall_score":75,"closing_probability":45,'
        '"strengths":["..."],"errors":["..."],'
        '"objections":[{"text":"objecion del cliente","response":"respuesta del vendedor","handled_well":false}],'
        '"techniques_used":["..."],"recommendations":["..."],"next_steps":["..."],'
        '"timeline":[{"id":"1","type":"start|rapport|interest|objection|error|closing|end","label":"...","timestamp_seconds":0,"is_highlight":false}]}\n\n'
        f"Transcripcion:\n{transcription}"
    )

    for attempt in range(4):
        try:
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "Eres experto en ventas B2B. JSON valido, sin explicaciones."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=1500,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            if "429" in str(e):
                wait = 15 * (attempt + 1)
                await asyncio.sleep(wait)
                continue
            raise
    raise Exception("Rate limit exceeded. Intenta de nuevo mas tarde.")


async def _process_call_with_text(call_id: str, transcription: str):
    call = calls_db.get(call_id)
    if not call:
        return

    try:
        call["status"] = "analyzing"
        call["progress"] = 40
        call["progress_text"] = "Analizando conversacion con IA..."

        analysis_data = await _analyze(transcription)

        call["progress"] = 90
        call["progress_text"] = "Generando reporte..."

        analysis = {
            "id": str(uuid.uuid4()),
            "call_id": call_id,
            "transcription": transcription,
            "summary": analysis_data.get("summary", ""),
            "overall_score": analysis_data.get("overall_score", 0),
            "closing_probability": analysis_data.get("closing_probability", 0),
            "strengths": analysis_data.get("strengths", []),
            "errors": analysis_data.get("errors", []),
            "objections": analysis_data.get("objections", []),
            "techniques_used": analysis_data.get("techniques_used", []),
            "recommendations": analysis_data.get("recommendations", []),
            "next_steps": analysis_data.get("next_steps", []),
            "timeline": analysis_data.get("timeline", []),
            "created_at": datetime.utcnow(),
        }

        analyses_db[call_id] = analysis
        call["status"] = "completed"
        call["progress"] = 100
        call["progress_text"] = "Analisis completado"

    except Exception as e:
        traceback.print_exc()
        call["status"] = "error"
        call["progress"] = 0
        call["progress_text"] = f"Error: {str(e)}"


async def _process_call_with_audio(call_id: str, audio_bytes: bytes, filename: str):
    call = calls_db.get(call_id)
    if not call:
        return

    try:
        file_size_mb = len(audio_bytes) / (1024 * 1024)
        if file_size_mb > 25:
            call["status"] = "error"
            call["progress"] = 0
            call["progress_text"] = f"Archivo muy grande ({file_size_mb:.0f}MB). Maximo 25MB para transcripcion. Intenta con modo texto."
            return

        call["status"] = "transcribing"
        call["progress"] = 20
        call["progress_text"] = "Transcribiendo audio con Whisper..."

        import httpx
        from app.core.config import get_settings
        settings = get_settings()

        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"
        content_types = {
            "mp3": "audio/mpeg", "wav": "audio/wav", "m4a": "audio/mp4",
            "ogg": "audio/ogg", "webm": "audio/webm", "flac": "audio/flac",
        }
        content_type = content_types.get(ext, "audio/mpeg")

        url = f"{settings.OPENAI_BASE_URL}/audio/transcriptions"
        async with httpx.AsyncClient() as http_client:
            files = {"file": (filename, audio_bytes, content_type)}
            data = {"model": settings.WHISPER_MODEL}
            headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
            response = await http_client.post(url, files=files, data=data, headers=headers, timeout=120.0)
            if response.status_code == 502:
                await asyncio.sleep(5)
                response = await http_client.post(url, files=files, data=data, headers=headers, timeout=120.0)
            response.raise_for_status()
            transcription = response.json()["text"]

        if len(transcription) > 4000:
            transcription = transcription[:4000] + "\n[Truncado]"

        call["status"] = "analyzing"
        call["progress"] = 50
        call["progress_text"] = "Analizando conversacion con IA..."

        analysis_data = await _analyze(transcription)

        call["progress"] = 90
        call["progress_text"] = "Generando reporte..."

        analysis = {
            "id": str(uuid.uuid4()),
            "call_id": call_id,
            "transcription": transcription,
            "summary": analysis_data.get("summary", ""),
            "overall_score": analysis_data.get("overall_score", 0),
            "closing_probability": analysis_data.get("closing_probability", 0),
            "strengths": analysis_data.get("strengths", []),
            "errors": analysis_data.get("errors", []),
            "objections": analysis_data.get("objections", []),
            "techniques_used": analysis_data.get("techniques_used", []),
            "recommendations": analysis_data.get("recommendations", []),
            "next_steps": analysis_data.get("next_steps", []),
            "timeline": analysis_data.get("timeline", []),
            "created_at": datetime.utcnow(),
        }

        analyses_db[call_id] = analysis
        call["status"] = "completed"
        call["progress"] = 100
        call["progress_text"] = "Analisis completado"

    except Exception as e:
        traceback.print_exc()
        call["status"] = "error"
        call["progress"] = 0
        call["progress_text"] = f"Error: {str(e)}"


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    all_calls = list(calls_db.values())
    return DashboardStats(
        calls_today=len([c for c in all_calls if c["created_at"].date() == datetime.utcnow().date()]),
        calls_this_week=len(all_calls),
        average_score=0,
        score_trend=0,
        weekly_goal={
            "calls_target": 25,
            "calls_completed": len(all_calls),
            "quality_target": 80,
            "quality_average": 0,
        },
        recent_calls=[CallResponse(**c) for c in all_calls[:5]],
    )


class TextAnalysisRequest(BaseModel):
    transcription: str
    client_name: Optional[str] = "Sin cliente"
    title: Optional[str] = "Llamada sin titulo"


@router.post("/calls/analyze-text", response_model=CallResponse)
async def analyze_text(
    background_tasks: BackgroundTasks,
    request: TextAnalysisRequest,
):
    call_id = str(uuid.uuid4())

    call = {
        "id": call_id,
        "user_id": "demo-user",
        "title": request.title,
        "client_name": request.client_name,
        "audio_url": None,
        "duration_seconds": 0,
        "status": "analyzing",
        "progress": 20,
        "progress_text": "Texto recibido, analizando con IA...",
        "created_at": datetime.utcnow(),
    }
    calls_db[call_id] = call

    background_tasks.add_task(_process_call_with_text, call_id, request.transcription)

    return CallResponse(**call)


@router.post("/calls/upload", response_model=CallResponse)
async def upload_call(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    client_name: str = Form(None),
):
    call_id = str(uuid.uuid4())
    audio_bytes = await audio.read()

    call = {
        "id": call_id,
        "user_id": "demo-user",
        "title": audio.filename or "Llamada sin titulo",
        "client_name": client_name or "Sin cliente",
        "audio_url": None,
        "duration_seconds": 0,
        "status": "uploading",
        "progress": 10,
        "progress_text": "Audio recibido, iniciando procesamiento...",
        "created_at": datetime.utcnow(),
    }
    calls_db[call_id] = call

    background_tasks.add_task(_process_call_with_audio, call_id, audio_bytes, audio.filename or "audio.mp3")

    return CallResponse(**call)


@router.get("/calls", response_model=list[CallResponse])
async def list_calls():
    calls = sorted(calls_db.values(), key=lambda c: c["created_at"], reverse=True)
    return [CallResponse(**c) for c in calls]


@router.get("/calls/{call_id}", response_model=CallResponse)
async def get_call(call_id: str):
    if call_id not in calls_db:
        raise HTTPException(status_code=404, detail="Call not found")
    return CallResponse(**calls_db[call_id])


@router.get("/analyses/{call_id}", response_model=AnalysisResponse)
async def get_analysis(call_id: str):
    if call_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return AnalysisResponse(**analyses_db[call_id])
