from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from uuid import UUID
import uuid

from app.schemas.schemas import (
    CallResponse,
    AnalysisResponse,
    CoachResponse,
    CoachMessage,
    DashboardStats,
)

router = APIRouter()

# In-memory storage for demo
calls_db: dict[str, dict] = {}
analyses_db: dict[str, dict] = {}


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    all_calls = list(calls_db.values())
    completed = [c for c in all_calls if c["status"] == "completed"]

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

    call = {
        "id": call_id,
        "user_id": "demo-user",
        "title": audio.filename or "Llamada sin título",
        "client_name": client_name or "Sin cliente",
        "audio_url": None,
        "duration_seconds": 0,
        "status": "completed",
        "created_at": datetime.utcnow(),
    }

    calls_db[call_id] = call

    # Create a demo analysis
    analysis = {
        "id": str(uuid.uuid4()),
        "call_id": call_id,
        "transcription": f"[Transcripción generada para: {audio.filename}]\n\nVENDEDOR: ¡Hola! Buenos días.\n\nCLIENTE: Hola, buenos días.\n\nVENDEDOR: ¿Cómo estás hoy?\n\nCLIENTE: Bien, ¿en qué puedo ayudarte?",
        "summary": "Llamada de prueba analizada correctamente. El sistema está funcionando.",
        "overall_score": 72,
        "closing_probability": 45,
        "strengths": [
            "Saludo profesional y amable",
            "Tono positivo durante la conversación",
        ],
        "errors": [
            "No se identificaron objeciones claras",
            "Cierre de llamada abrupto",
        ],
        "objections": [],
        "techniques_used": ["Saludo profesional", "Preguntas abiertas"],
        "recommendations": [
            "Profundizar en las necesidades del cliente",
            "Usar la técnica SPIN Selling",
            "Practicar el cierre de ventas",
        ],
        "next_steps": [
            "Agendar seguimiento",
            "Preparar propuesta personalizada",
        ],
        "timeline": [
            {"id": "1", "type": "start", "label": "Inicio", "timestamp_seconds": 0, "is_highlight": False},
            {"id": "2", "type": "rapport", "label": "Rapport", "timestamp_seconds": 15, "is_highlight": False},
            {"id": "3", "type": "end", "label": "Fin", "timestamp_seconds": 120, "is_highlight": False},
        ],
        "created_at": datetime.utcnow(),
    }

    analyses_db[call_id] = analysis

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
