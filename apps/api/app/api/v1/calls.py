from fastapi import APIRouter, UploadFile, File, HTTPException
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

    prompt = """Eres un experto en analisis de llamadas de ventas. Analiza la siguiente transcripcion y devuelve un JSON con esta estructura EXACTA:

{
  "summary": "Resumen detallado de la llamada (2-3 oraciones)",
  "overall_score": 75,
  "closing_probability": 45,
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "errors": ["error 1", "error 2"],
  "objections": [
    {
      "text": "objecion del cliente",
      "response": "respuesta del vendedor",
      "handled_well": false
    }
  ],
  "techniques_used": ["tecnica 1", "tecnica 2"],
  "recommendations": ["recomendacion 1", "recomendacion 2"],
  "next_steps": ["paso 1", "paso 2"],
  "timeline": [
    {
      "id": "1",
      "type": "start",
      "label": "Inicio",
      "timestamp_seconds": 0,
      "is_highlight": false
    }
  ]
}

Tipos de timeline: start, rapport, interest, objection, error, closing, end
Scores: 0-100

Transcripcion:
{transcription}"""

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
        "status": "processing",
        "created_at": datetime.utcnow(),
    }
    calls_db[call_id] = call

    try:
        transcription = await _transcribe(audio_bytes, audio.filename or "audio.mp3")
        analysis_data = await _analyze(transcription)

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

    except Exception as e:
        traceback.print_exc()
        call["status"] = "error"

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
