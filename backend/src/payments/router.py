from fastapi import APIRouter, Query, Depends
from src.sql.db import DBSession
from src.sql.models import Payment, User
from src.users.dependecies import require_authentication
from src.payments.use_cases import get_payment_for_order_and_user, create_payment_for_order

payments_router = APIRouter(prefix="/payments", tags=["payments"])


@payments_router.get("/status", response_model=Payment)
async def check_payment_get(
    session: DBSession,
    order_id: int = Query(
        description="The unique identifier of the order to check payment status for", default=1),
    user: User = Depends(require_authentication)
) -> Payment:
    """Endpoint to check the payment status of an order."""
    payment = await get_payment_for_order_and_user(session, order_id, user.get_user_id())
    return payment


@payments_router.post("/create", response_model=Payment)
async def create_payment_post(
    session: DBSession,
    order_id: int = Query(
        description="The unique identifier of the order to create a payment for", default=1),
    user: User = Depends(require_authentication)
) -> Payment:
    """Endpoint to create a payment for an order."""
    payment = await create_payment_for_order(session, order_id, user)
    return payment
