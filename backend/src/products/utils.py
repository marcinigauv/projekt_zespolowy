from sqlalchemy import select, or_
from src.products.enums import ProductSortingDirection
from src.products.exceptions import ProductNotFoundException
from src.products.models import Product, ProductResponse, ProductSearchRequest
from src.sql.db import DBSession


async def get_products_from_db(
    session: DBSession,
    search_request: ProductSearchRequest,
) -> list[ProductResponse]:
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

    return [ProductResponse.from_product(product) for product in products]


async def get_product_by_id_from_db(
    session: DBSession,
    product_id: int,
) -> ProductResponse:
    stmt = select(Product).where(Product.id == product_id)

    result = await session.execute(stmt)
    product = result.scalar_one_or_none()

    if product is None:
        raise ProductNotFoundException(product_id)

    return ProductResponse.from_product(product)
