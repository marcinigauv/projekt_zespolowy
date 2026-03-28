from fastapi import APIRouter, Depends
from src.sql.db import DBSession
from src.sql.models import User, Order
from src.orders.models import OrderResponse, CreateOrderRequest, ListOrdersRequest
from src.users.dependecies import require_authentication
from src.orders.use_cases import fetch_order_by_id, fetch_orders_by_customer_id, create_order_for_customer
from typing import Union

orders_router = APIRouter(prefix="/orders", tags=["orders"])


@orders_router.post("/orders", response_model=list[OrderResponse])
async def list_orders(list_orders_request: ListOrdersRequest, session: DBSession, user: User = Depends(require_authentication)) -> list[OrderResponse]:
    """Endpoint to get a list of all orders for a specific customer."""
    results = await fetch_orders_by_customer_id(list_orders_request, user.get_user_id(), session)
    return results


@orders_router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, session: DBSession, user: User = Depends(require_authentication)) -> OrderResponse:
    """Endpoint to get a specific order by its ID."""
    order = await fetch_order_by_id(order_id=order_id, user=user, session=session)
    return order


@orders_router.post("/", response_model=Union[OrderResponse, Order])
async def create_order(order_request: CreateOrderRequest, session: DBSession, user: User = Depends(require_authentication)) -> OrderResponse | Order:
    """Endpoint to create a new order."""
    order = await create_order_for_customer(customer_id=user.get_user_id(), products_info=order_request.products, session=session)
    return order
