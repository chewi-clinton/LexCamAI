import os
import json
from typing import AsyncGenerator, List, Dict

import httpx

from .llm import generate_answer_from_documents


def generate(prompt: str, documents: List[Dict], max_tokens: int = 256) -> str:
    # synchronous wrapper to existing llm function
    return generate_answer_from_documents(prompt, documents, max_tokens=max_tokens)


async def stream_generate(prompt: str, documents: List[Dict], max_tokens: int = 256, system_prompt: str = None) -> AsyncGenerator[str, None]:
    """
    Stream tokens from a configured Groq console streaming endpoint.

    Behavior:
    - Reads `GROQ_API_URL` and `GROQ_API_KEY` from env.
    - POSTs a JSON payload with the prompt and documents.
    - Expects a text/event-stream or chunked newline-delimited stream where
      each chunk is either a JSON object (containing 'token' or 'text') or
      plain text. Yields text fragments as they arrive.

    Falls back to the synchronous `generate` implementation when no GROQ
    configuration is available.
    """
    groq_url = os.getenv("GROQ_API_URL")
    groq_key = os.getenv("GROQ_API_KEY")

    if not groq_url or not groq_key:
        # fallback to non-streaming generation, then chunk
        answer = generate(prompt, documents, max_tokens=max_tokens)
        # simple sentence splitting
        import re

        parts = re.split(r'(?<=[\.\!\?])\s+', answer)
        if len(parts) == 1:
            chunk_size = 120
            for i in range(0, len(answer), chunk_size):
                yield answer[i : i + chunk_size]
            return
        for p in parts:
            if p.strip():
                yield p.strip()
        return

    groq_model = os.getenv("GROQ_MODEL", "llama3-8b-8192")
    headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
    # OpenAI-compatible format required by Groq /openai/v1/chat/completions
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    payload = {
        "model": groq_model,
        "messages": messages,
        "max_tokens": max_tokens,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=None) as client:
        try:
            async with client.stream("POST", groq_url, json=payload, headers=headers) as resp:
                resp.raise_for_status()
                buf = ""
                async for chunk in resp.aiter_text():
                    buf += chunk
                    lines = buf.split("\n")
                    buf = lines[-1]  # keep any incomplete trailing line
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
                                delta = choices[0].get("delta", {})
                                tok = delta.get("content", "")
                                if tok:
                                    yield tok
                                    continue
                            tok = obj.get("token") or obj.get("text")
                            if tok:
                                yield tok
                        except Exception:
                            pass  # skip malformed lines silently
        except httpx.HTTPError:
            answer = generate(prompt, documents, max_tokens=max_tokens)
            yield answer
