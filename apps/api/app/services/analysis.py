from openai import AsyncOpenAI
from app.core.config import get_settings
import json

settings = get_settings()

client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL,
)

ANALYSIS_PROMPT = """Eres un experto en análisis de llamadas de ventas. Analiza la siguiente transcripción y devuelve un JSON con esta estructura EXACTA:

{
  "summary": "Resumen detallado de la llamada (2-3 oraciones)",
  "overall_score": 75,
  "closing_probability": 45,
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "errors": ["error 1", "error 2"],
  "objections": [
    {
      "text": "objeción del cliente",
      "response": "respuesta del vendedor",
      "handled_well": false
    }
  ],
  "techniques_used": ["técnica 1", "técnica 2"],
  "recommendations": ["recomendación 1", "recomendación 2"],
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

Transcripción:
{transcription}"""


async def analyze_call(transcription: str) -> dict:
    """Analyze a call transcription using Groq LLM"""
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "Eres un experto en ventas B2B. Respondes SOLO con JSON válido, sin markdown ni explicaciones.",
            },
            {
                "role": "user",
                "content": ANALYSIS_PROMPT.format(transcription=transcription),
            },
        ],
        temperature=0.3,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    return json.loads(content)


async def coach_chat(message: str, context: str = None) -> str:
    """Chat with the AI coach"""
    system_prompt = """Eres un coach de ventas experto con 20 años de experiencia. 
    Ayudas a vendedores a mejorar su rendimiento en llamadas comerciales.
    
    Proporciona consejos prácticos, accionables y específicos.
    Usa ejemplos concretos y técnicas de ventas reconocidas (SPIN Selling, MEDDIC, etc.).
    Sé directo pero empático.
    
    Responde en español, máximo 300 palabras."""

    messages = [{"role": "system", "content": system_prompt}]

    if context:
        messages.append({
            "role": "system",
            "content": f"Contexto de la llamada analizada:\n{context}",
        })

    messages.append({"role": "user", "content": message})

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=1000,
    )

    return response.choices[0].message.content
