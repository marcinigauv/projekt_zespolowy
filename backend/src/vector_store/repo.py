from chromadb import Collection
from src.products.models import ProductResponse as ProductModel
from src.vector_store.utils import get_embedding
from src.vector_store.db import get_chroma_client
from typing import Any
from numpy import ndarray


class ProductVectorRepository:
    COLLECTION_NAME = "products_collection"

    def __init__(self):
        self.client = get_chroma_client()
        self.collection: Collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

    def upsert(self, product: ProductModel) -> None:
        """Adds or updates a product in Chroma Vector Store."""
        content = f"{product.name} {product.description or ''}".strip()
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
            metadatas=[metadata]
        )
        print(f"Upserted product with ID {product.id} into vector store.")

    def delete(self, product_id: int) -> None:
        """Deletes a product from Chroma Vector Store."""
        self.collection.delete(ids=[str(product_id)])
        print(f"Deleted product with ID {product_id} from vector store.")

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

    def check_if_product_exists(self, product_id: int) -> bool:
        """Checks if a product exists in Chroma Vector Store."""
        result = self.collection.get(ids=[str(product_id)])
        return bool(result and result["ids"])

    def ensure_product_exists(self, product: ProductModel) -> None:
        """Ensures that a product exists in Chroma Vector Store, if not, it creates it."""
        if not self.check_if_product_exists(product.id):
            self.upsert(product)


def get_vector_store_repo() -> ProductVectorRepository:
    """Utility function to get an instance of ProductVectorRepository."""
    return ProductVectorRepository()
