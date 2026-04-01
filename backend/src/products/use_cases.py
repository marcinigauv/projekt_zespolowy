from src.products.models import ProductSearchRequest, ProductResponse
from src.products.exceptions import ProductNotFoundException
from src.sql.db import DBSession
from src.products.utils import get_products_from_db, get_product_by_id_from_db
from src.products.dependencies import fetch_similar_products_in_vector_store


async def get_products(
    search_request: ProductSearchRequest,
    session: DBSession
) -> list[ProductResponse]:
    """Use case to get a paginated list of products with optional filters."""
    results = await get_products_from_db(session, search_request)
    return [ProductResponse.model_validate(result) for result in results]


async def get_product_by_id(
    session: DBSession,
    product_id: int,
) -> ProductResponse:
    """Use case to get a product by its ID."""
    result = await get_product_by_id_from_db(session, product_id)
    if not result:
        raise ProductNotFoundException(product_id)
    response = ProductResponse.model_validate(result)
    return response


async def get_similar_products_by_product_id(
    session: DBSession,
    product_id: int,
) -> list[ProductResponse]:
    """Use case to get similar products to a given product ID."""
    result = await get_product_by_id_from_db(session, product_id)
    if not result:
        raise ProductNotFoundException(product_id)
    similar_products = await fetch_similar_products_in_vector_store(product_id, session)
    return similar_products
