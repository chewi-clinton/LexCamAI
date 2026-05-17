import os
from typing import Optional
import httpx

# Simple translator using HuggingFace translation models when HF_API_KEY is set.
# Falls back to returning the input text unchanged.

HF_API_URL = "https://api-inference.huggingface.co/models"
HF_API_KEY = os.getenv("HF_API_KEY")


async def translate_text(text: str, src_lang: str, tgt_lang: str) -> str:
    """Translate `text` from src_lang to tgt_lang. Uses HF translation models when
    available. Returns original text on failure or when no translator configured.
    """
    if not HF_API_KEY:
        return text

    # choose a Helsinki model for common en<->fr translations
    model = None
    if src_lang.startswith("fr") and tgt_lang.startswith("en"):
        model = "Helsinki-NLP/opus-mt-fr-en"
    elif src_lang.startswith("en") and tgt_lang.startswith("fr"):
        model = "Helsinki-NLP/opus-mt-en-fr"
    else:
        # for other pairs, don't attempt automatic translation
        return text

    headers = {"Authorization": f"Bearer {HF_API_KEY}", "Accept": "application/json"}
    payload = {"inputs": text}

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(f"{HF_API_URL}/{model}", json=payload, headers=headers)
            resp.raise_for_status()
            body = resp.json()
            # HF translation models typically return [{'translation_text': '...'}]
            if isinstance(body, list) and body and "translation_text" in body[0]:
                return body[0]["translation_text"]
            if isinstance(body, dict) and "translation_text" in body:
                return body["translation_text"]
            # fallback: if model returns a string
            if isinstance(body, str):
                return body
        except Exception:
            return text

    return text
