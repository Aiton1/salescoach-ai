from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from datetime import datetime
import uuid
import json
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


async def _transcribe(audio_bytes: bytes, filename: str) -> str:
    import httpx
    from app.core.config import get_settings
    settings = get_settings()

    url = f"{settings.OPENAI_BASE_URL}/audio/transcriptions"
    async with httpx.AsyncClient() as client:
        files = {"file": (filename, audio_bytes, "audio/mpeg")}
        data = {"model": settings.WHISPER_MODEL}
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
        response = await client.post(url, files=files, data=data, headers=headers, timeout=120.0)
        response.raise_for_status()
        return response.json()["text"]


async def _analyze(transcription: str) -> dict:
    from openai import AsyncOpenAI
    from app.core.config import get_settings
    settings = get_settings()

    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL,
    )

    prompt = "Eres un experto en analisis de llamadas de ventas. Analiza la siguiente transcripcion y devuelve un JSON con esta estructura EXACTA:\n\n"
    prompt += '{"summary": "Resumen detallado (2-3 oraciones)", "overall_score": 75, "closing_probability": 45, "strengths": ["fortaleza 1"], "errors": ["error 1"], "objections": [{"text": "objecion", "response": "respuesta", "handled_well": false}], "techniques_used": ["tecnica 1"], "recommendations": ["recomendacion 1"], "next_steps": ["paso 1"], "timeline": [{"id": "1", "type": "start", "label": "Inicio", "timestamp_seconds": 0, "is_highlight": false}]}\n\n'
    prompt += "Tipos de timeline: start, rapport, interest, objection, error, closing, end\nScores: 0-100\n\nTranscripcion:\n"
    prompt += transcription

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "Eres un experto en ventas B2B. Respondes SOLO con JSON valido, sin markdown ni explicaciones.",
            },
            {
                "role": "user",
                "content": prompt.format(transcription=transcription),
            },
        ],
        temperature=0.3,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    return json.loads(content)


async def _process_call(call_id: str, audio_bytes: bytes, filename: str):
    call = calls_db.get(call_id)
    if not call:
        return

    try:
        # Stage 1: Transcribing
        call["status"] = "transcribing"
        call["progress"] = 20
        call["progress_text"] = "Transcribiendo audio con Whisper..."

        transcription = await _transcribe(audio_bytes, filename)

        # Stage 2: Analyzing
        call["status"] = "analyzing"
        call["progress"] = 60
        call["progress_text"] = "Analizando conversacion con IA..."

        analysis_data = await _analyze(transcription)

        # Stage 3: Building results
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


@router.post("/calls/upload", response_model=CallResponse)
async def upload_call(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    client_name: str = None,
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

    background_tasks.add_task(_process_call, call_id, audio_bytes, audio.filename or "audio.mp3")

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
