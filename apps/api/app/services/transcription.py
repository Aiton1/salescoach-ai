import httpx
from app.core.config import get_settings

settings = get_settings()

GROQ_API_URL = f"{settings.OPENAI_BASE_URL}/audio/transcriptions"


async def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    """Transcribe audio using Groq Whisper API"""
    async with httpx.AsyncClient() as client:
        files = {"file": (filename, audio_bytes, "audio/mpeg")}
        data = {"model": settings.WHISPER_MODEL}
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}

        response = await client.post(
            GROQ_API_URL,
            files=files,
            data=data,
            headers=headers,
            timeout=120.0,
        )
        response.raise_for_status()
        result = response.json()
        return result["text"]
