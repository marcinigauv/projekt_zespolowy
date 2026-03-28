from sqlalchemy import select, or_, update
from src.products.enums import ProductSortingDirection
from src.products.models import Product, ProductSearchRequest
from src.sql.db import DBSession
from typing import Optional
from decimal import Decimal


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
                Product.description.ilike(pattern)
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


async def get_product_by_id_from_db(
    session: DBSession,
    product_id: int,
) -> Optional[Product]:
    stmt = select(Product).where(Product.id == product_id)

    result = await session.execute(stmt)
    product = result.scalar_one_or_none()

    return product


async def get_product_quantity_and_price_from_db(
    session: DBSession,
    product_id: int,
) -> Optional[tuple[int, Decimal]]:
    stmt = select(Product.amount, Product.price).where(
        Product.id == product_id)

    result = await session.execute(stmt)
    quantity_and_price = result.one_or_none()

    return quantity_and_price


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
