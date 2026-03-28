from src.sql.models import Order
from src.sql.db import DBSession
from src.products.models import ProductResponse
from src.orders.models import OrderDetailResponse, OrderResponse
from src.products.utils import get_product_by_id_from_db
import asyncio


async def map_order_to_order_response(order: Order, session: DBSession) -> OrderResponse:
    order_details_response: list[OrderDetailResponse] = []
    tasks = []
    for order_detail_db in order.items:
        task = asyncio.create_task(get_product_by_id_from_db(
            session, order_detail_db.product_id))
        tasks.append(task)
    for order_detail_db, product_details_db in zip(order.items, await asyncio.gather(*tasks)):
        _product_detail_response = ProductResponse.model_validate(
            product_details_db)
        order_detail_response = OrderDetailResponse(
            id=order_detail_db.id,
            quantity=order_detail_db.quantity,
            unit_price=order_detail_db.unit_price,
            product=_product_detail_response
        )
        order_details_response.append(order_detail_response)
    order_response = OrderResponse(
        id=order.get_order_id(),
        customer_id=order.customer_id,
        total_amount=order.total_amount,
        items=order_details_response,
        order_date=order.order_date,
    )
    return order_response
