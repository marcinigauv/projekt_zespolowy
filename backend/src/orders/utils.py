from src.sql.models import Order, OrderDetail
from src.sql.db import DBSession
from src.orders.models import ProductInfoRequest
from sqlalchemy import select
from typing import Optional, cast
from decimal import Decimal


async def get_order_from_db_by_id(order_id: int, session: DBSession) -> Optional[Order]:
    order = await session.get(Order, order_id)
    return order


async def get_orders_from_db_by_customer_id(customer_id: int, page_number: int, page_size: int, session: DBSession) -> list[Order]:
    stmt = select(Order).where(Order.customer_id == customer_id).offset(
        (page_number - 1) * page_size).limit(page_size)
    results = await session.execute(stmt)
    orders = results.scalars().all()
    return orders


async def create_order_in_db(customer_id: int, products_info: list[ProductInfoRequest], product_prices: dict[int, Decimal], session: DBSession) -> Order:
    try:
        total_price = cast(Decimal, sum(
            product_prices[product_info.product_id] * product_info.quantity for product_info in products_info))

        new_order = Order(
            customer_id=customer_id,
            total_amount=total_price
        )
        session.add(new_order)
        await session.flush()

        if not new_order.id:
            raise RuntimeError("Failed to create order: No ID assigned.")

        for product_info in products_info:
            order_detail = OrderDetail(
                quantity=product_info.quantity,
                unit_price=product_prices[product_info.product_id],
                order_id=new_order.id,
                product_id=product_info.product_id,
            )
            session.add(order_detail)

        await session.commit()

        await session.refresh(new_order, ["items"])

        return new_order

    except Exception as exc:
        await session.rollback()
        raise RuntimeError(
            f"Failed to create order for customer_id={customer_id}"
        ) from exc
