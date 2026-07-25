from fastapi import APIRouter
from app.schemas.schemas import CoachMessage, CoachResponse
from app.services.analysis import coach_chat

router = APIRouter()


@router.post("/chat", response_model=CoachResponse)
async def chat_with_coach(message: CoachMessage):
    response = await coach_chat(message.message)

    suggestions = [
        "Practicar manejo de objeciones",
        "Revisar técnica de cierre",
        "Mejorar escucha activa",
    ]

    return CoachResponse(response=response, suggestions=suggestions)
