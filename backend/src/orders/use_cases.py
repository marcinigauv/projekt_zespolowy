from src.sql.db import DBSession
from src.sql.models import User
from src.orders.models import OrderResponse, ProductInfoRequest, ListOrdersRequest
from src.orders.utils import get_order_from_db_by_id, get_orders_from_db_by_customer_id
from src.orders.exceptions import OrderNotFoundException, NoAccessToOrderException
from src.orders.dependencies import ensure_products_exist_and_get_prices, save_new_order
from src.orders.mappers import map_order_to_order_response


async def fetch_order_by_id(order_id: int, user: User, session: DBSession) -> OrderResponse:
    order = await get_order_from_db_by_id(order_id, session)
    if not order:
        raise OrderNotFoundException(order_id=order_id)
    if order.customer_id != user.get_user_id():
        raise NoAccessToOrderException(order_id=order_id)
    return await map_order_to_order_response(order, session)


async def fetch_orders_by_customer_id(list_orders_request: ListOrdersRequest, customer_id: int, session: DBSession) -> list[OrderResponse]:
    orders = await get_orders_from_db_by_customer_id(customer_id, list_orders_request.page, list_orders_request.page_size, session)
    return [await map_order_to_order_response(order, session) for order in orders]


async def create_order_for_customer(customer_id: int, products_info: list[ProductInfoRequest], session: DBSession) -> OrderResponse:
    product_prices = await ensure_products_exist_and_get_prices(products_info, session)
    order = await save_new_order(customer_id=customer_id, products_info=products_info, product_prices=product_prices, session=session)
    return await map_order_to_order_response(order, session)
