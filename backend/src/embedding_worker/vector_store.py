from functools import lru_cache
from typing import Any

from chromadb import Collection
from chromadb import HttpClient
from chromadb.api import ClientAPI
from chromadb.config import Settings

from src.embedding_worker.config import config
from src.embedding_worker.embeddings import get_embedding
from src.products.models import ProductResponse


@lru_cache(maxsize=1)
def get_chroma_client() -> ClientAPI:
    return HttpClient(
        host=config.vector_store_settings.chroma_host,
        port=config.vector_store_settings.chroma_port,
        settings=Settings(
            anonymized_telemetry=config.vector_store_settings.chroma_anonymized_telemetry,
        ),
    )


class EmbeddingWorkerVectorStore:
    COLLECTION_NAME = "products_collection"

    def __init__(self):
        self.client = get_chroma_client()
        self.collection: Collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    def reset_collection(self) -> None:
        try:
            self.client.delete_collection(name=self.COLLECTION_NAME)
        except Exception:
            pass

        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    def upsert(self, product: ProductResponse) -> None:
        categories_text = " ".join(
            product.categories) if product.categories else ""
        content = f"{product.name} {categories_text} {product.description or ''}".strip()
        embedding = get_embedding(content)

        metadata: dict[str, Any] = {
            "name": product.name,
            "price": float(product.price),
        }
        if product.categories:
            metadata["categories"] = product.categories

        self.collection.upsert(
            ids=[str(product.id)],
            embeddings=[embedding],
            metadatas=[metadata],
        )


def get_embedding_worker_vector_store() -> EmbeddingWorkerVectorStore:
    return EmbeddingWorkerVectorStore()
