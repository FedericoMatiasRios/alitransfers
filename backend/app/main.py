import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    reply: str


def parse_cors_origins(raw_value: str | None) -> list[str]:
    if not raw_value:
        return [
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "https://www.alitransfers.com",
            "https://alitransfers.com",
        ]
    return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
CORS_ORIGINS = parse_cors_origins(os.getenv("CORS_ORIGINS"))

BUSINESS_CONTEXT = """
You are the AliTransfers website assistant.

Business facts:
- Brand: AliTransfers (Alicante Transfers)
- Service: Private airport/city transfers in Costa Blanca and surrounding areas.
- Core route logic: All transfers are between Alicante Airport and a city/town, in both directions.
    That means Alicante Airport -> destination city OR destination city -> Alicante Airport.
- Coverage: Alicante, Santa Pola, Elche, Alicante Centro, Benidorm, Orihuela, La Mata,
  Arenales del Sol, El Altet, Torrevieja, Gran Alacant, Valencia, and other cities by quote.
- Service style: 24/7, punctual, professional driver, modern and clean vehicle.
- Contact booking channel: WhatsApp +34 643 00 12 15.

Reference pricing shown on website (Airport <-> City):
- Santa Pola: From 25 EUR
- Elche: From 30 EUR
- Alicante Centro: From 30 EUR
- Benidorm: From 100 EUR
- Orihuela: From 85 EUR
- La Mata: From 50 EUR
- Arenales del Sol: From 30 EUR
- El Altet: From 25 EUR
- Torrevieja: From 65 EUR
- Gran Alacant: From 30 EUR
- Valencia: Ask for quote
- Other cities: Ask for quote

Rules:
- Always treat user requests as Alicante Airport <-> city transfers unless the user explicitly asks a different route.
- If route direction is ambiguous, clarify that the reference price applies both ways (airport to city and city to airport).
- If user asks price for one of the listed cities, answer directly with the website reference price.
- Mention these are reference prices and final amount depends on mileage and exact pickup/dropoff area.
- If destination is not listed, ask for quote and suggest contacting WhatsApp.
- Keep answers concise and complete (avoid unfinished sentences).
- Reply in the same language used by the user.
"""

app = FastAPI(title="AliTransfers Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
        f"?key={GEMINI_API_KEY}"
    )

    body: dict[str, Any] = {
        "systemInstruction": {
            "parts": [{"text": BUSINESS_CONTEXT}],
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": payload.message}],
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1200,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=body)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini upstream error: {exc.response.text}",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Gemini connection error: {str(exc)}") from exc

    try:
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(status_code=502, detail="Unexpected Gemini response format")

    return ChatResponse(reply=reply)
