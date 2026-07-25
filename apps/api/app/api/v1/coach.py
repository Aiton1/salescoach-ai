from fastapi import APIRouter
from app.schemas.schemas import CoachMessage, CoachResponse
from app.services.analysis import coach_chat

router = APIRouter()


@router.post("/chat", response_model=CoachResponse)
async def chat_with_coach(message: CoachMessage):
    context = None

    if message.call_id:
        from supabase import create_client
        from app.core.config import get_settings
        settings = get_settings()
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

        result = supabase.table("analyses").select("*").eq("call_id", str(message.call_id)).execute()
        rows = result.data or []
        if rows:
            a = rows[0]
            context = (
                f"ANALISIS DE LLAMADA RECIENTE:\n"
                f"Resumen: {a.get('summary', '')}\n"
                f"Puntuacion: {a.get('overall_score', 0)}/100\n"
                f"Probabilidad de cierre: {a.get('closing_probability', 0)}%\n"
                f"Fortalezas: {', '.join(a.get('strengths', []))}\n"
                f"Errores: {', '.join(a.get('errors', []))}\n"
                f"Recomendaciones: {', '.join(a.get('recommendations', []))}\n"
                f"Transcripcion: {a.get('transcription', '')[:2000]}"
            )

    response = await coach_chat(message.message, context=context)

    suggestions = []
    if context:
        suggestions = [
            "Analizar mis errores en esta llamada",
            "Como mejorar mi manejo de objeciones?",
            "Dame ejemplos de mejores respuestas",
        ]
    else:
        suggestions = [
            "Practicar manejo de objeciones",
            "Revisar tecnica de cierre",
            "Mejorar escucha activa",
        ]

    return CoachResponse(response=response, suggestions=suggestions)
