from chromadb import Collection
from src.vector_store.db import get_chroma_client
from numpy import ndarray


class ProductVectorRepository:
    COLLECTION_NAME = "products_collection"

    def __init__(self):
        self.client = get_chroma_client()
        self.collection: Collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

    def search_for_similar_product(self, base_product_id: int, limit: int = 10) -> list[int]:
        """Search for products similar to the given base product. Result list is ordered, also can be empty."""
        base_product = self.collection.get(
            ids=[str(base_product_id)],
            include=["embeddings"]
        )

        if not base_product or 'embeddings' not in base_product:
            return []

        if not isinstance(base_product["embeddings"], ndarray) or len(base_product["embeddings"]) == 0:
            return []

        query_embedding = base_product["embeddings"][0]

        result = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["metadatas", "distances"]
        )

        ids = result.get("ids")
        if not ids or not ids[0]:
            return []

        return [int(pid) for pid in ids[0] if int(pid) != base_product_id]


def get_vector_store_repo() -> ProductVectorRepository:
    """Utility function to get an instance of ProductVectorRepository."""
    return ProductVectorRepository()
