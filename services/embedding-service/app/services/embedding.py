from __future__ import annotations

import logging

import anyio
from sentence_transformers import SentenceTransformer

from app.config import settings


class EmbeddingModel:
    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None
        self._dimension: int | None = None

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            raise RuntimeError("Embedding model is not loaded")
        return self._model

    @property
    def dimension(self) -> int:
        if self._dimension is None:
            raise RuntimeError("Embedding dimension is not available")
        return self._dimension

    async def load(self) -> None:
        def _load() -> SentenceTransformer:
            model = SentenceTransformer(settings.model_name, device=settings.device)
            model.max_seq_length = settings.max_seq_length
            return model

        self._model = await anyio.to_thread.run_sync(_load)
        self._dimension = self._model.get_sentence_embedding_dimension()
        logging.getLogger(__name__).info(
            "Embedding model loaded: %s (%s, dim=%s)",
            settings.model_name,
            settings.device,
            self._dimension,
        )

    async def embed(
        self,
        texts: list[str],
        input_type: str | None,
        normalize: bool | None,
    ) -> list[list[float]]:
        if input_type:
            prefix = f"{input_type}: "
            texts = [f"{prefix}{text}" for text in texts]

        normalize_embeddings = (
            settings.normalize_embeddings if normalize is None else normalize
        )

        def _encode() -> list[list[float]]:
            vectors = self.model.encode(
                texts,
                batch_size=min(len(texts), settings.max_batch_size),
                convert_to_numpy=True,
                normalize_embeddings=normalize_embeddings,
                show_progress_bar=False,
            )
            return vectors.tolist()

        return await anyio.to_thread.run_sync(_encode)
