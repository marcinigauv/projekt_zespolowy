from src.orders.models import ProductInfoRequest
from src.sql.db import DBSession
from src.sql.models import Order
from src.orders.exceptions import InsufficientStockException
from src.products.exceptions import ProductNotFoundException
from src.products.utils import get_product_quantity_and_price_from_db, decrease_product_stock_in_db
from src.orders.utils import create_order_in_db
import asyncio
from decimal import Decimal


async def ensure_products_exist_and_get_prices(products_info: list[ProductInfoRequest], session: DBSession) -> dict[int, Decimal]:
    """Dependency function to ensure all products exist in the database and their requested quantities are available. It also returns the prices of the products."""
    results = await asyncio.gather(*(get_product_quantity_and_price_from_db(session, product_info.product_id) for product_info in products_info))
    product_prices: dict[int, Decimal] = {}
    for product, quantity_and_price in zip(products_info, results):
        if quantity_and_price is None:
            raise ProductNotFoundException(product_id=product.product_id)
        available_quantity, price = quantity_and_price
        if available_quantity < product.quantity:
            raise InsufficientStockException(
                product_id=product.product_id, requested_quantity=product.quantity, available_quantity=available_quantity)
        product_prices[product.product_id] = price
    return product_prices


async def save_new_order(customer_id: int, products_info: list[ProductInfoRequest], product_prices: dict[int, Decimal], session: DBSession) -> Order:
    """Dependency function to save a new order in the database. This function should be called after ensuring that all products exist and have sufficient stock."""
    order = await create_order_in_db(customer_id=customer_id, products_info=products_info, product_prices=product_prices, session=session)
    await asyncio.gather(*(decrease_product_stock_in_db(product_info.product_id, product_info.quantity, session) for product_info in products_info))
    return order
