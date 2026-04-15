from src.products.models import ProductCreateRequest, ProductSearchRequest, ProductResponse, ProductUpdateRequest
from src.products.exceptions import ProductNotFoundException
from src.sql.db import DBSession
from src.products.utils import add_product_to_db, delete_product_from_db, edit_product_in_db, get_products_from_db, get_product_by_id_from_db
from src.products.dependencies import fetch_similar_products_in_vector_store, remove_product_from_vector_store, save_product_in_vector_store


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


async def add_product(
    session: DBSession,
    product_request: ProductCreateRequest,
) -> ProductResponse:
    product = await add_product_to_db(session, product_request)
    response = ProductResponse.from_product(product)
    save_product_in_vector_store(response)
    return response


async def edit_product(
    session: DBSession,
    product_id: int,
    product_request: ProductUpdateRequest,
) -> ProductResponse:
    product = await edit_product_in_db(session, product_id, product_request)
    if not product:
        raise ProductNotFoundException(product_id)
    response = ProductResponse.from_product(product)
    save_product_in_vector_store(response)
    return response


async def delete_product(
    session: DBSession,
    product_id: int,
) -> bool:
    deleted = await delete_product_from_db(session, product_id)
    if not deleted:
        raise ProductNotFoundException(product_id)
    remove_product_from_vector_store(product_id)
    return True
