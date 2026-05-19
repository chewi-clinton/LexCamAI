from __future__ import annotations

import logging
from typing import Optional

import anyio
import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer

from app.config import settings
from pathlib import Path


class EmbeddingModel:
    """ONNX-based embedding model runner.

    Expects an ONNX model file at `/cache/model.onnx`. This class uses a
    Hugging Face tokenizer (from `settings.model_name`) and runs the ONNX
    session to obtain the last hidden state, applies mean-pooling and
    optional L2-normalization to produce sentence embeddings.
    """

    def __init__(self) -> None:
        self._tokenizer: Optional[AutoTokenizer] = None
        self._session: Optional[ort.InferenceSession] = None
        self._dimension: Optional[int] = None

    @property
    def dimension(self) -> int:
        if self._dimension is None:
            raise RuntimeError("Embedding dimension is not available")
        return self._dimension

    async def load(self) -> None:
        def _load():
            tokenizer = AutoTokenizer.from_pretrained(settings.model_name, use_fast=True)

            model_path = self._resolve_model_path()
            if not model_path.exists():
                raise RuntimeError(
                    f"ONNX model not found at {model_path}.\n"
                    "Provide MODEL_PATH or let the Docker build download it via MODEL_URL."
                )
            session = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])

            # Attempt to infer hidden dimension from the first output shape
            outputs = session.get_outputs()
            hidden_size: Optional[int] = None
            if outputs:
                out_shape = outputs[0].shape  # e.g., (batch, seq_len, hidden)
                if len(out_shape) >= 3 and out_shape[2] is not None:
                    hidden_size = int(out_shape[2])

            return tokenizer, session, hidden_size

        self._tokenizer, self._session, self._dimension = await anyio.to_thread.run_sync(_load)
        logging.getLogger(__name__).info(
            "ONNX embedding model loaded: %s (dim=%s)", settings.model_name, self._dimension
        )

    def _resolve_model_path(self) -> Path:
        if settings.model_path:
            return Path(settings.model_path)

        try:
            repo_backup = Path(__file__).resolve().parents[4].joinpath("_safe_backups", "model.onnx")
            if repo_backup.exists():
                return repo_backup
        except IndexError:
            pass

        return Path("/cache/model.onnx")

    async def embed(self, texts: list[str], input_type: str | None, normalize: bool | None) -> list[list[float]]:
        if input_type:
            prefix = f"{input_type}: "
            texts = [f"{prefix}{t}" for t in texts]

        normalize_embeddings = settings.normalize_embeddings if normalize is None else normalize

        def _encode() -> list[list[float]]:
            assert self._tokenizer is not None and self._session is not None

            enc = self._tokenizer(
                texts,
                padding=True,
                truncation=True,
                max_length=settings.max_seq_length,
                return_tensors="np",
            )

            # ONNX runtime expects numpy inputs; supply token_type_ids as zeros
            # if the tokenizer (e.g. RoBERTa) doesn't produce them but the model needs them
            ort_inputs = {k: v for k, v in enc.items()}
            required = {i.name for i in self._session.get_inputs()}
            if "token_type_ids" in required and "token_type_ids" not in ort_inputs:
                ort_inputs["token_type_ids"] = np.zeros_like(ort_inputs["input_ids"])
            outputs = self._session.run(None, ort_inputs)

            # assume outputs[0] is last_hidden_state: (batch, seq_len, hidden)
            last_hidden = outputs[0]
            attention_mask = enc.get("attention_mask")
            if attention_mask is None:
                # fallback: average across tokens
                embeddings = last_hidden.mean(axis=1)
            else:
                mask = attention_mask.astype(np.float32)[..., None]
                summed = (last_hidden * mask).sum(axis=1)
                counts = mask.sum(axis=1)
                counts[counts == 0] = 1
                embeddings = summed / counts

            if normalize_embeddings:
                norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
                norms[norms == 0] = 1
                embeddings = embeddings / norms

            return embeddings.tolist()

        return await anyio.to_thread.run_sync(_encode)
