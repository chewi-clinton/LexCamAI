import os
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import List, Dict

HF_API_URL = "https://api-inference.huggingface.co/models"
HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = os.getenv("HF_MODEL", "google/flan-t5-small")
FALLBACK_MODEL = os.getenv("HF_FALLBACK_MODEL", "gpt2")


class LLMError(Exception):
    pass


@retry(reraise=True, stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10),
       retry=retry_if_exception_type((httpx.HTTPError, LLMError)))
def generate_answer_from_documents(query: str, documents: List[Dict[str, str]], max_tokens: int = 256) -> str:
    if not HF_API_KEY:
        raise LLMError("HF_API_KEY not set")

    # Build prompt with provenance instructions
    prompt_parts = [f"You are an assistant. Answer the question using only the provided documents."
                    , f"Question: {query}", "Documents:"]
    for i, doc in enumerate(documents, start=1):
        snippet = doc.get("snippet") or doc.get("content") or ""
        prompt_parts.append(f"[{i}] id={doc.get('id')} score={doc.get('score', '')} text={snippet}")

    prompt_parts.append("Provide a concise answer and at the end list the document ids used as sources.")
    prompt = "\n\n".join(prompt_parts)

    headers = {"Authorization": f"Bearer {HF_API_KEY}", "Accept": "application/json"}
    url = f"{HF_API_URL}/{HF_MODEL}"
    payload = {"inputs": prompt, "parameters": {"max_new_tokens": max_tokens, "return_full_text": False}}

    with httpx.Client(timeout=30.0) as client:
        resp = client.post(url, json=payload, headers=headers)
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            # If model not found, try fallback model once
            if e.response.status_code == 404:
                # Model not hosted or unavailable; fall back to deterministic synthesis
                # Build simple concatenation of top snippets as a safe fallback
                snippets = [d.get("snippet") or d.get("content") or "" for d in documents]
                synthesized = "\n\n".join(snippets[:3]) or "No relevant documents found."
                return f"(fallback synthesis) {synthesized}\n\nNote: HF model {HF_MODEL} unavailable."
            if e.response.status_code == 404 and FALLBACK_MODEL and FALLBACK_MODEL != HF_MODEL:
                url_fb = f"{HF_API_URL}/{FALLBACK_MODEL}"
                resp_fb = client.post(url_fb, json=payload, headers=headers)
                try:
                    resp_fb.raise_for_status()
                    body = resp_fb.json()
                except httpx.HTTPStatusError as e2:
                    raise LLMError(f"HF API error (fallback): {e2.response.status_code} {e2.response.text}")
            else:
                raise LLMError(f"HF API error: {e.response.status_code} {e.response.text}")
        else:
            body = resp.json()
        # HF Inference API can return different shapes depending on model; handle common cases
        if isinstance(body, list) and len(body) and "generated_text" in body[0]:
            return body[0]["generated_text"]
        if isinstance(body, dict) and "generated_text" in body:
            return body["generated_text"]
        # Fallback: try to pull 'text' or string
        if isinstance(body, dict) and "error" in body:
            raise LLMError(f"HF API returned error: {body['error']}")
        # Last resort: stringify
        return str(body)
