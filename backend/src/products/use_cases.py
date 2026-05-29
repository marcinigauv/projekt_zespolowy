from src.products.models import (
    ProductCreateRequest,
    ProductRatingAverageResponse,
    ProductRatingCreateRequest,
    ProductRatingResponse,
    ProductUserRatingResponse,
    ProductResponse,
    ProductSearchRequest,
    ProductUpdateRequest,
)
from src.products.exceptions import ProductNotFoundException, ProductRatingPurchaseRequiredException
from src.sql.db import DBSession
from src.products.utils import (
    add_product_to_db,
    delete_product_from_db,
    edit_product_in_db,
    get_product_by_id_from_db,
    get_product_rating_average_from_db,
    get_product_rating_for_user_from_db,
    get_products_from_db,
    has_user_purchased_and_paid_product_in_db,
    upsert_product_rating_in_db,
)
from src.products.dependencies import (
    fetch_recommended_products_for_user_by_product_id as fetch_personalized_products_for_user_by_product_id,
    fetch_similar_products_in_vector_store,
)


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


async def get_recommended_products_for_user_by_product_id(
    session: DBSession,
    product_id: int,
    user_id: int,
) -> list[ProductResponse]:
    """Use case to get personalized recommendations for an authenticated user on a given product page."""
    result = await get_product_by_id_from_db(session, product_id)
    if not result:
        raise ProductNotFoundException(product_id)

    recommended_products = await fetch_personalized_products_for_user_by_product_id(
        product_id,
        user_id,
        session,
    )
    return recommended_products


async def rate_product_for_user(
    session: DBSession,
    product_id: int,
    user_id: int,
    rating_request: ProductRatingCreateRequest,
) -> ProductRatingResponse:
    result = await get_product_by_id_from_db(session, product_id)
    if not result:
        raise ProductNotFoundException(product_id)

    is_purchase_confirmed = await has_user_purchased_and_paid_product_in_db(
        session,
        user_id,
        product_id,
    )
    if not is_purchase_confirmed:
        raise ProductRatingPurchaseRequiredException(product_id)

    stored_rating = await upsert_product_rating_in_db(
        session,
        user_id,
        product_id,
        rating_request.rating,
    )
    return ProductRatingResponse.from_product_rating(stored_rating)


async def get_product_rating_for_user_by_product_id(
    session: DBSession,
    product_id: int,
    user_id: int,
) -> ProductUserRatingResponse:
    result = await get_product_by_id_from_db(session, product_id)
    if not result:
        raise ProductNotFoundException(product_id)

    user_rating = await get_product_rating_for_user_from_db(
        session,
        user_id,
        product_id,
    )

    return ProductUserRatingResponse(
        product_id=product_id,
        user_id=user_id,
        rating=user_rating.rating if user_rating else None,
    )


async def get_product_rating_average_by_product_id(
    session: DBSession,
    product_id: int,
) -> ProductRatingAverageResponse:
    result = await get_product_by_id_from_db(session, product_id)
    if not result:
        raise ProductNotFoundException(product_id)

    average_rating, ratings_count = await get_product_rating_average_from_db(
        session,
        product_id,
    )
    return ProductRatingAverageResponse(
        product_id=product_id,
        average_rating=average_rating,
        ratings_count=ratings_count,
    )


async def add_product(
    session: DBSession,
    product_request: ProductCreateRequest,
) -> ProductResponse:
    product = await add_product_to_db(session, product_request)
    return ProductResponse.from_product(product)


async def edit_product(
    session: DBSession,
    product_id: int,
    product_request: ProductUpdateRequest,
) -> ProductResponse:
    product = await edit_product_in_db(session, product_id, product_request)
    if not product:
        raise ProductNotFoundException(product_id)
    return ProductResponse.from_product(product)


async def delete_product(
    session: DBSession,
    product_id: int,
) -> bool:
    deleted = await delete_product_from_db(session, product_id)
    if not deleted:
        raise ProductNotFoundException(product_id)
    return True
