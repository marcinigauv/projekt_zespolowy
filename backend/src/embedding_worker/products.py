from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession as SQLModelAsyncSession

from src.products.models import ProductResponse
from src.sql.models import Product


async def get_product_batch(
    session: SQLModelAsyncSession,
    page_size: int,
    page: int,
) -> list[ProductResponse]:
    stmt = select(Product).offset(page * page_size).limit(page_size)
    result = await session.execute(stmt)
    products = result.scalars().all()
    return [ProductResponse.from_product(product) for product in products]
