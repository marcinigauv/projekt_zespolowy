import os
from functools import lru_cache

from sentence_transformers import SentenceTransformer


DEFAULT_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
ZERO_EMBEDDING_SIZE = 384


def get_model_name() -> str:
    raw_value = os.getenv("EMBEDDING_WORKER_MODEL_NAME")
    if raw_value is None or not raw_value.strip():
        return DEFAULT_MODEL_NAME
    return raw_value.strip()


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer(get_model_name(), device="cpu")


def get_embedding(text: str) -> list[float]:
    if not text or not text.strip():
        return [0.0] * ZERO_EMBEDDING_SIZE

    embedding = get_model().encode(
        text.strip(),
        normalize_embeddings=True,
        convert_to_numpy=True,
    )
    return embedding.tolist()