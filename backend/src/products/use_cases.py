from src.products.models import ProductSearchRequest, ProductResponse
from src.sql.db import DBSession
from src.products.utils import get_products_from_db, get_product_by_id_from_db


async def get_products(
    search_request: ProductSearchRequest,
    session: DBSession
) -> list[ProductResponse]:
    """Use case to get a paginated list of products with optional filters."""
    return await get_products_from_db(session, search_request)


async def get_product_by_id(
    session: DBSession,
    product_id: int,
) -> ProductResponse:
    """Use case to get a product by its ID."""
    return await get_product_by_id_from_db(session, product_id)
