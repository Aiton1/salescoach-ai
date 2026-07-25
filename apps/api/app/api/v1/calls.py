from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
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


def _get_supabase():
    from supabase import create_client
    from app.core.config import get_settings
    settings = get_settings()
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def _update_call_status(call_id: str, **kwargs):
    supabase = _get_supabase()
    supabase.table("calls").update(kwargs).eq("id", call_id).execute()


async def _analyze(transcription: str) -> dict:
    from openai import AsyncOpenAI
    from app.core.config import get_settings
    settings = get_settings()

    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL,
    )

    p1 = (
        "Eres un experto en ventas B2B y coaching comercial. "
        "Analiza la siguiente transcripcion de llamada de ventas y produce un JSON detallado.\n\n"
        "Responde SOLO con JSON valido (sin markdown, sin explicaciones). Estructura:\n"
        '{"summary":"Resumen detallado de 3-4 oraciones sobre la llamada: contexto, objetivos, resultado.",'
        '"overall_score":numero 0-100 sobre la calidad general de la llamada,'
        '"closing_probability":numero 0-100 probabilidad realista de cierre,'
        '"strengths":["Lo que el vendedor hizo bien, con detalle y ejemplos especificos de la conversacion."],'
         '"errors":["Errores o oportunidades perdidas, explicando por que son errores."],'
         '"corrections":[{"issue":"Aspecto concreto a mejorar","evidence":"Frase o momento exacto de la transcripcion que demuestra el problema","tactic":"Tactica de ventas aplicable y como usarla paso a paso","ideal_response":"Respuesta exacta que daria un vendedor excelente, natural y adaptada al contexto","why_it_works":"Por que esta respuesta reduce el riesgo y avanza la conversacion"}],'
         '"objections":[{"text":"objecion exacta del cliente","response":"respuesta del vendedor","handled_well":true_o_false,"analysis":"Analisis de POR QUE la respuesta fue buena o mala, que podria haber dicho mejor."}],'
        '"techniques_used":["Tecnicas de ventas identificadas (ej: SPIN selling, manejo de objeciones, creacion de urgencia, anchoring). Explicar donde se aplicaron."],'
        '"recommendations":["Recomendaciones accionables y especificas para mejorar."],'
        '"next_steps":["Pasos de seguimiento concretos que el vendedor deberia tomar."],'
        '"timeline":[{"id":"1","type":"start|rapport|discovery|presentation|objection|negotiation|closing|positive_moment|error|end","label":"Nombre del momento","timestamp_seconds":0,"description":"Que paso en detalle","is_highlight":true_o_false,"seller_action":"Que hizo el vendedor","client_reaction":"Como reacciono el cliente","score_impact":+5_o_-3_o_0}],'
        '"seller_behavior":[{"moment":"En que momento clave","behavior":"Que hizo el vendedor","impact":"Impacto en la llamada","suggestion":"Sugerencia de mejora"}],'
        '"client_sentiment":[{"moment":"Timestamp o fase","sentiment":"positive|neutral|negative|interested|resistant|excited","indicator":"Por que se determino ese sentimiento"}]}\n\n'
    )
    p2 = (
        "Criterios de evaluacion: Rapport (10 pts), Descubrimiento de necesidades (20 pts), "
        "Presentacion de solucion (20 pts), Manejo de objeciones (20 pts), Cierre (20 pts), "
        "Seguimiento (10 pts). Justifica el overall_score con estos criterios.\n\n"
        "Para cada correction usa evidencia literal de la transcripcion cuando exista. "
        "No inventes frases ni momentos. La ideal_response debe sonar natural, ser breve y "
        "mostrar exactamente como responderia un vendedor excelente en ese contexto. "
        "Incluye entre 3 y 6 corrections para los errores mas importantes, priorizadas por impacto.\n\n"
        "Transcripcion:\n" + transcription
    )
    prompt = p1 + p2

    for attempt in range(4):
        try:
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "Eres experto en ventas B2B y coaching comercial. JSON valido, sin explicaciones, sin markdown."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=4000,
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


def _insert_analysis(call_id: str, transcription: str, analysis_data: dict):
    supabase = _get_supabase()
    supabase.table("analyses").insert({
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
         "corrections": analysis_data.get("corrections", []),
         "next_steps": analysis_data.get("next_steps", []),
        "timeline": analysis_data.get("timeline", []),
        "seller_behavior": analysis_data.get("seller_behavior", []),
        "client_sentiment": analysis_data.get("client_sentiment", []),
    }).execute()


async def _process_call_with_text(call_id: str, transcription: str):
    try:
        _update_call_status(call_id, status="analyzing", progress=40, progress_text="Analizando conversacion con IA...")

        analysis_data = await _analyze(transcription)

        _update_call_status(call_id, progress=90, progress_text="Generando reporte...")

        _insert_analysis(call_id, transcription, analysis_data)

        _update_call_status(call_id, status="completed", progress=100, progress_text="Analisis completado")

    except Exception as e:
        traceback.print_exc()
        _update_call_status(call_id, status="error", progress=0, progress_text="Error: " + str(e))


async def _process_call_with_audio(call_id: str, audio_bytes: bytes, filename: str):
    try:
        supabase = _get_supabase()

        file_size_mb = len(audio_bytes) / (1024 * 1024)
        if file_size_mb > 25:
            _update_call_status(
                call_id, status="error", progress=0,
                progress_text="Archivo muy grande (" + str(int(file_size_mb)) + "MB). Maximo 25MB para transcripcion. Intenta con modo texto."
            )
            return

        _update_call_status(call_id, status="uploading", progress=10, progress_text="Subiendo audio a almacenamiento...")

        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"
        storage_path = call_id + "." + ext
        content_types = {
            "mp3": "audio/mpeg", "wav": "audio/wav", "m4a": "audio/mp4",
            "ogg": "audio/ogg", "webm": "audio/webm", "flac": "audio/flac",
        }
        content_type = content_types.get(ext, "audio/mpeg")

        supabase.storage.from_("call-audios").upload(storage_path, audio_bytes, {"content-type": content_type})
        audio_url = supabase.storage.from_("call-audios").get_public_url(storage_path)

        _update_call_status(call_id, status="transcribing", progress=20, progress_text="Transcribiendo audio con Whisper...", audio_url=audio_url, audio_path=storage_path)

        from app.core.config import get_settings
        settings = get_settings()
        import httpx

        url = settings.OPENAI_BASE_URL + "/audio/transcriptions"
        async with httpx.AsyncClient() as http_client:
            files = {"file": (filename, audio_bytes, content_type)}
            data = {"model": settings.WHISPER_MODEL}
            headers = {"Authorization": "Bearer " + settings.OPENAI_API_KEY}
            response = await http_client.post(url, files=files, data=data, headers=headers, timeout=120.0)
            if response.status_code == 502:
                await asyncio.sleep(5)
                response = await http_client.post(url, files=files, data=data, headers=headers, timeout=120.0)
            response.raise_for_status()
            transcription = response.json()["text"]

        if len(transcription) > 4000:
            transcription = transcription[:4000] + "\n[Truncado]"

        _update_call_status(call_id, status="analyzing", progress=50, progress_text="Analizando conversacion con IA...")

        analysis_data = await _analyze(transcription)

        _update_call_status(call_id, progress=90, progress_text="Generando reporte...")

        _insert_analysis(call_id, transcription, analysis_data)

        _update_call_status(call_id, status="completed", progress=100, progress_text="Analisis completado")

    except Exception as e:
        traceback.print_exc()
        _update_call_status(call_id, status="error", progress=0, progress_text="Error: " + str(e))


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    supabase = _get_supabase()
    result = supabase.table("calls").select("*").order("created_at", desc=True).execute()
    all_calls = result.data or []

    today = datetime.utcnow().date()
    calls_today = 0
    for c in all_calls:
        created = c.get("created_at", "")
        if created:
            try:
                dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                if dt.date() == today:
                    calls_today += 1
            except Exception:
                pass

    # Calculate average score from completed analyses
    avg_score = 0.0
    score_trend = 0.0
    analyses_result = supabase.table("analyses").select("overall_score").execute()
    analyses = analyses_result.data or []
    scores = [a["overall_score"] for a in analyses if a.get("overall_score")]
    if scores:
        avg_score = round(sum(scores) / len(scores), 1)
        # Trend: compare last 3 scores vs previous 3
        if len(scores) >= 6:
            recent = scores[:3]
            previous = scores[3:6]
            avg_recent = sum(recent) / len(recent)
            avg_previous = sum(previous) / len(previous)
            score_trend = round(avg_recent - avg_previous, 1)

    return DashboardStats(
        calls_today=calls_today,
        calls_this_week=len(all_calls),
        average_score=avg_score,
        score_trend=score_trend,
        weekly_goal={
            "calls_target": 25,
            "calls_completed": len(all_calls),
            "quality_target": 80,
            "quality_average": avg_score,
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
    supabase = _get_supabase()
    call_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    row = {
        "id": call_id,
        "user_id": "demo-user",
        "title": request.title,
        "client_name": request.client_name,
        "audio_url": None,
        "duration_seconds": 0,
        "status": "analyzing",
        "progress": 20,
        "progress_text": "Texto recibido, analizando con IA...",
        "created_at": now,
    }
    supabase.table("calls").insert(row).execute()

    background_tasks.add_task(_process_call_with_text, call_id, request.transcription)

    return CallResponse(**row)


@router.post("/calls/upload", response_model=CallResponse)
async def upload_call(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    client_name: str = Form(None),
):
    supabase = _get_supabase()
    call_id = str(uuid.uuid4())
    audio_bytes = await audio.read()
    now = datetime.utcnow().isoformat()

    row = {
        "id": call_id,
        "user_id": "demo-user",
        "title": audio.filename or "Llamada sin titulo",
        "client_name": client_name or "Sin cliente",
        "audio_url": None,
        "duration_seconds": 0,
        "status": "uploading",
        "progress": 10,
        "progress_text": "Audio recibido, iniciando procesamiento...",
        "created_at": now,
    }
    supabase.table("calls").insert(row).execute()

    background_tasks.add_task(_process_call_with_audio, call_id, audio_bytes, audio.filename or "audio.mp3")

    return CallResponse(**row)


@router.get("/calls", response_model=list[CallResponse])
async def list_calls():
    supabase = _get_supabase()
    result = supabase.table("calls").select("*").order("created_at", desc=True).execute()
    calls = result.data or []
    return [CallResponse(**c) for c in calls]


@router.get("/calls/{call_id}", response_model=CallResponse)
async def get_call(call_id: str):
    supabase = _get_supabase()
    result = supabase.table("calls").select("*").eq("id", call_id).execute()
    calls = result.data or []
    if not calls:
        raise HTTPException(status_code=404, detail="Call not found")
    return CallResponse(**calls[0])


@router.get("/analyses/{call_id}", response_model=AnalysisResponse)
async def get_analysis(call_id: str):
    supabase = _get_supabase()
    result = supabase.table("analyses").select("*").eq("call_id", call_id).execute()
    rows = result.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return AnalysisResponse(**rows[0])
