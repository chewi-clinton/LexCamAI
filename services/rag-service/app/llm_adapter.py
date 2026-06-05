import os
import json
from typing import AsyncGenerator, List, Dict

import httpx

from .llm import generate_answer_from_documents


def generate(prompt: str, documents: List[Dict], max_tokens: int = 256) -> str:
    return generate_answer_from_documents(prompt, documents, max_tokens=max_tokens)


async def _stream_openai_compat(
    url: str,
    headers: dict,
    payload: dict,
    fallback_fn,
) -> AsyncGenerator[str, None]:
    """Stream tokens from any OpenAI-compatible chat/completions endpoint."""
    async with httpx.AsyncClient(timeout=None) as client:
        try:
            async with client.stream("POST", url, json=payload, headers=headers) as resp:
                resp.raise_for_status()
                buf = ""
                async for chunk in resp.aiter_text():
                    buf += chunk
                    lines = buf.split("\n")
                    buf = lines[-1]
                    for line in lines[:-1]:
                        line = line.strip()
                        if not line or not line.startswith("data:"):
                            continue
                        content = line[len("data:"):].strip()
                        if content == "[DONE]":
                            return
                        try:
                            obj = json.loads(content)
                            choices = obj.get("choices") or []
                            if choices:
                                tok = choices[0].get("delta", {}).get("content", "")
                                if tok:
                                    yield tok
                        except Exception:
                            pass
        except httpx.HTTPError:
            answer = fallback_fn()
            yield answer


async def stream_generate(
    prompt: str,
    documents: List[Dict],
    max_tokens: int = 512,
    system_prompt: str = None,
) -> AsyncGenerator[str, None]:
    import re

    ollama_url = os.getenv("OLLAMA_URL")
    groq_key = os.getenv("GROQ_API_KEY")
    groq_url = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")

    def _local_fallback():
        return generate(prompt, documents, max_tokens=max_tokens)

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    # ── Primary: Groq llama-3.3-70b-versatile (most intelligent) ───────────
    if groq_key:
        model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "stream": True,
        }
        async for tok in _stream_openai_compat(
            url=groq_url,
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json",
            },
            payload=payload,
            fallback_fn=_local_fallback,
        ):
            yield tok
        return

    # ── Secondary: self-hosted Ollama/Qwen (no rate limits) ─────────────────
    if ollama_url:
        model = os.getenv("LLM_MODEL", "qwen2.5:1.5b")
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "stream": True,
        }
        async for tok in _stream_openai_compat(
            url=f"{ollama_url.rstrip('/')}/chat/completions",
            headers={"Content-Type": "application/json"},
            payload=payload,
            fallback_fn=_local_fallback,
        ):
            yield tok
        return

    # ── Last resort: HF Inference API (sync, chunked) ────────────────────────
    answer = generate(prompt, documents, max_tokens=max_tokens)
    parts = re.split(r'(?<=[\.\!\?])\s+', answer)
    if len(parts) == 1:
        chunk_size = 120
        for i in range(0, len(answer), chunk_size):
            yield answer[i: i + chunk_size]
        return
    for p in parts:
        if p.strip():
            yield p.strip()
