from src.vector_store.repo import get_vector_store_repo
from src.products.models import ProductResponse
from src.products.utils import get_products_by_ids_from_db
from src.sql.db import DBSession


async def fetch_similar_products_in_vector_store(product_id: int, session: DBSession) -> list[ProductResponse]:
    """Ensures that similar products to the given product ID are present in the Chroma Vector Store."""
    repo = get_vector_store_repo()
    similar_product_ids = repo.search_for_similar_product(
        base_product_id=product_id, limit=10)

    if not similar_product_ids:
        return []

    results = await get_products_by_ids_from_db(session, similar_product_ids)
    return [ProductResponse.from_product(product) for product in results]
