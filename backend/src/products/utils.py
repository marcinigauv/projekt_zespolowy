from collections import defaultdict
from datetime import datetime
from sqlalchemy import select, or_, update, func
from src.products.enums import ProductSortingDirection
from src.products.models import ProductCreateRequest, ProductUpdateRequest, Product, ProductSearchRequest, PaginatedProductsResponse, ProductResponse
from src.sql.db import DBSession
from src.sql.models import Order, OrderDetail, Payment, ProductRating
from src.payments.enums import PaymentStatus
from typing import Optional
from decimal import Decimal


RECOMMENDATION_CANDIDATE_LIMIT = 200
RECOMMENDATION_RESULT_LIMIT = 10


async def get_products_from_db(
    session: DBSession,
    search_request: ProductSearchRequest,
) -> list[Product]:
    stmt = select(Product).offset(
        search_request.offset).limit(search_request.limit)

    if search_request.category and search_request.category.strip():
        stmt = stmt.where(Product.categories.any(
            search_request.category.strip()))

    if search_request.substring and search_request.substring.strip():
        pattern = f"%{search_request.substring.strip()}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
                func.array_to_string(Product.categories, ' ').ilike(pattern),
            )
        )

    if search_request.sorting_field is not None and search_request.sorting_order is not None:
        sortable_columns = {
            "name": Product.name,
            "price": Product.price,
            "amount": Product.amount,
        }
        sort_column = sortable_columns.get(search_request.sorting_field.value)
        if sort_column is not None:
            if search_request.sorting_order == ProductSortingDirection.ASC:
                stmt = stmt.order_by(sort_column.asc())
            else:
                stmt = stmt.order_by(sort_column.desc())

    result = await session.execute(stmt)
    products = result.scalars().all()

    return list(products)


async def get_all_products_in_chunks_from_db(
        session: DBSession,
        page_size: int = 100,
        page: int = 0) -> PaginatedProductsResponse:
    stmt = select(Product).offset(page * page_size).limit(page_size)
    result = await session.execute(stmt)
    products = result.scalars().all()
    return PaginatedProductsResponse(
        products=[ProductResponse.from_product(
            product) for product in products],
        total=len(products),
        page=page,
        page_size=page_size
    )


async def get_top_10_products_with_lowest_stock_from_db(
        session: DBSession) -> list[Product]:
    stmt = (
        select(Product)
        .where(Product.amount > 0)
        .order_by(Product.amount.asc())
        .limit(10)
    )
    result = await session.execute(stmt)
    products = result.scalars().all()
    return products


async def get_top_10_new_products_from_db(
        session: DBSession) -> list[Product]:
    stmt = (
        select(Product)
        .where(Product.amount > 0)
        .order_by(Product.id.desc())
        .limit(10)
    )
    result = await session.execute(stmt)
    products = result.scalars().all()
    return products


async def get_top_10_products_with_highest_price_from_db(
        session: DBSession) -> list[Product]:
    stmt = (
        select(Product)
        .where(Product.amount > 0)
        .order_by(Product.price.desc())
        .limit(10)
    )
    result = await session.execute(stmt)
    products = result.scalars().all()
    return products


async def get_top_10_products_with_lowest_price_from_db(
        session: DBSession) -> list[Product]:
    stmt = (
        select(Product)
        .where(Product.amount > 0)
        .order_by(Product.price.asc())
        .limit(10)
    )
    result = await session.execute(stmt)
    products = result.scalars().all()
    return products


async def get_product_by_id_from_db(
    session: DBSession,
    product_id: int,
) -> Optional[Product]:
    stmt = select(Product).where(Product.id == product_id)

    result = await session.execute(stmt)
    product = result.scalar_one_or_none()

    return product


async def add_product_to_db(
    session: DBSession,
    product_request: ProductCreateRequest,
) -> Product:
    product = Product.model_validate(product_request.model_dump())
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


async def edit_product_in_db(
    session: DBSession,
    product_id: int,
    product_request: ProductUpdateRequest,
) -> Optional[Product]:
    product = await get_product_by_id_from_db(session, product_id)
    if product is None:
        return None

    for field, value in product_request.model_dump().items():
        setattr(product, field, value)

    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


async def delete_product_from_db(
    session: DBSession,
    product_id: int,
) -> bool:
    product = await get_product_by_id_from_db(session, product_id)
    if product is None:
        return False

    await session.delete(product)
    await session.commit()
    return True


async def get_products_by_ids_from_db(
    session: DBSession,
    product_ids: list[int],
) -> list[Product]:
    stmt = select(Product).where(Product.id.in_(product_ids))

    result = await session.execute(stmt)
    products = result.scalars().all()

    return products


async def get_product_quantity_and_price_from_db(
    session: DBSession,
    product_id: int,
) -> Optional[tuple[int, Decimal]]:
    stmt = select(Product.amount, Product.price).where(
        Product.id == product_id)

    result = await session.execute(stmt)
    quantity_and_price = result.one_or_none()

    return quantity_and_price


async def has_user_purchased_and_paid_product_in_db(
    session: DBSession,
    user_id: int,
    product_id: int,
) -> bool:
    stmt = (
        select(OrderDetail.id)
        .join(Order, Order.id == OrderDetail.order_id)
        .join(Payment, Payment.order_id == Order.id)
        .where(
            Order.customer_id == user_id,
            OrderDetail.product_id == product_id,
            Payment.status == PaymentStatus.CONFIRMED.value,
        )
        .limit(1)
    )

    result = await session.execute(stmt)
    purchased_order_detail_id = result.scalar_one_or_none()
    return purchased_order_detail_id is not None


async def upsert_product_rating_in_db(
    session: DBSession,
    user_id: int,
    product_id: int,
    rating: int,
) -> ProductRating:
    stmt = select(ProductRating).where(
        ProductRating.user_id == user_id,
        ProductRating.product_id == product_id,
    )
    result = await session.execute(stmt)
    existing_rating = result.scalar_one_or_none()

    if existing_rating is None:
        stored_rating = ProductRating(
            user_id=user_id,
            product_id=product_id,
            rating=rating,
        )
        session.add(stored_rating)
    else:
        existing_rating.rating = rating
        existing_rating.updated_at = datetime.now()
        session.add(existing_rating)
        stored_rating = existing_rating

    await session.commit()
    await session.refresh(stored_rating)
    return stored_rating


async def get_product_rating_for_user_from_db(
    session: DBSession,
    user_id: int,
    product_id: int,
) -> Optional[ProductRating]:
    stmt = select(ProductRating).where(
        ProductRating.user_id == user_id,
        ProductRating.product_id == product_id,
    )

    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_product_rating_average_from_db(
    session: DBSession,
    product_id: int,
) -> tuple[Optional[float], int]:
    stmt = select(
        func.avg(ProductRating.rating),
        func.count(ProductRating.id),
    ).where(ProductRating.product_id == product_id)

    result = await session.execute(stmt)
    average_rating, ratings_count = result.one()

    normalized_count = int(ratings_count)
    if normalized_count == 0 or average_rating is None:
        return None, 0

    return float(average_rating), normalized_count


async def decrease_product_stock_in_db(product_id: int, quantity: int, session: DBSession) -> None:
    stmt = (
        update(Product)
        .where(Product.id == product_id, Product.amount >= quantity)
        .values(amount=Product.amount - quantity)
        .returning(Product.id)
    )
    result = await session.execute(stmt)
    updated_product_id = result.scalar_one_or_none()

    if updated_product_id is None:
        raise RuntimeError(
            f"Failed to decrease stock for product_id={product_id}."
        )


def _normalize_categories(categories: list[str]) -> set[str]:
    return {
        category.strip().lower()
        for category in categories
        if isinstance(category, str) and category.strip()
    }


async def _get_user_purchase_profile(
    session: DBSession,
    user_id: int,
) -> tuple[set[int], dict[str, int], Optional[Decimal]]:
    stmt = (
        select(OrderDetail.product_id,
               OrderDetail.quantity, OrderDetail.unit_price)
        .join(Order, Order.id == OrderDetail.order_id)
        .join(Payment, Payment.order_id == Order.id)
        .where(
            Order.customer_id == user_id,
            Payment.status == PaymentStatus.CONFIRMED.value,
        )
    )

    result = await session.execute(stmt)
    purchased_rows = result.all()

    if not purchased_rows:
        return set(), {}, None

    purchased_product_ids = {
        int(product_id)
        for product_id, _, _ in purchased_rows
    }
    purchased_products = await get_products_by_ids_from_db(session, list(purchased_product_ids))

    categories_by_product_id: dict[int, set[str]] = {}
    for product in purchased_products:
        if product.id is None:
            continue
        categories_by_product_id[product.id] = _normalize_categories(
            product.categories)

    category_weights: defaultdict[str, int] = defaultdict(int)
    weighted_total_price = Decimal("0")
    weighted_quantity = 0

    for product_id, quantity, unit_price in purchased_rows:
        normalized_quantity = max(1, int(quantity))
        weighted_total_price += Decimal(unit_price) * normalized_quantity
        weighted_quantity += normalized_quantity

        product_categories = categories_by_product_id.get(
            int(product_id), set())
        for category in product_categories:
            category_weights[category] += normalized_quantity

    average_price = weighted_total_price / \
        weighted_quantity if weighted_quantity > 0 else None
    return purchased_product_ids, dict(category_weights), average_price


def _score_recommendation_candidate(
    candidate: Product,
    current_product_categories: set[str],
    purchase_category_weights: dict[str, int],
    purchase_average_price: Optional[Decimal],
) -> int:
    score = 0
    candidate_categories = _normalize_categories(candidate.categories)

    if current_product_categories and candidate_categories:
        shared_with_current = current_product_categories.intersection(
            candidate_categories)
        score += len(shared_with_current) * 6

    if purchase_category_weights and candidate_categories:
        score += sum(purchase_category_weights.get(category, 0)
                     for category in candidate_categories) * 2

    if purchase_average_price is not None:
        price_diff = abs(Decimal(candidate.price) - purchase_average_price)
        primary_threshold = max(
            purchase_average_price * Decimal("0.25"), Decimal("25"))

        if price_diff <= primary_threshold:
            score += 4
        elif price_diff <= primary_threshold * 2:
            score += 2

    if candidate.amount >= 10:
        score += 2
    elif candidate.amount > 0:
        score += 1

    return score


async def get_recommended_products_for_user_by_product_id_from_db(
    session: DBSession,
    user_id: int,
    product_id: int,
    limit: int = RECOMMENDATION_RESULT_LIMIT,
) -> list[Product]:
    current_product = await get_product_by_id_from_db(session, product_id)
    if not current_product:
        return []

    current_product_categories = _normalize_categories(
        current_product.categories)
    purchased_product_ids, purchase_category_weights, purchase_average_price = await _get_user_purchase_profile(session, user_id)

    stmt = select(Product).where(Product.id != product_id, Product.amount > 0)

    if purchased_product_ids:
        stmt = stmt.where(~Product.id.in_(purchased_product_ids))

    stmt = stmt.order_by(Product.id.desc()).limit(
        RECOMMENDATION_CANDIDATE_LIMIT)

    result = await session.execute(stmt)
    candidates = list(result.scalars().all())

    if not candidates:
        return []

    scored_candidates = [
        (
            candidate,
            _score_recommendation_candidate(
                candidate,
                current_product_categories,
                purchase_category_weights,
                purchase_average_price,
            ),
        )
        for candidate in candidates
    ]

    scored_candidates.sort(
        key=lambda item: (
            item[1],
            item[0].amount,
            item[0].id or 0,
        ),
        reverse=True,
    )

    limited_results = [candidate for candidate,
                       _ in scored_candidates[:max(1, limit)]]
    return limited_results
