from sqlalchemy import select, or_, update
from src.products.enums import ProductSortingDirection
from src.products.models import ProductCreateRequest, ProductUpdateRequest, Product, ProductSearchRequest, PaginatedProductsResponse, ProductResponse
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
