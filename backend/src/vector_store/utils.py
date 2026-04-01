from sentence_transformers import SentenceTransformer

_model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", device="cpu")


def get_embedding(text: str) -> list[float]:
    if not text or not text.strip():
        return [0.0] * 384

    embedding = _model.encode(
        text.strip(),
        normalize_embeddings=True,
        convert_to_numpy=True,
    )
    return embedding.tolist()
