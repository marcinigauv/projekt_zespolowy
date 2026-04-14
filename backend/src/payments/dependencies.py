from src.payments.utils import verify_payment_status, create_payment_for_order_in_db, create_payment_at_provider, read_order_from_db
from src.orders.exceptions import OrderNotFoundException
from src.sql.db import DBSession
from src.sql.models import Payment, Order, User
from typing import Optional


async def ensure_order_payment_status_loaded(session: DBSession, order_id: int) -> Optional[Order]:
    """Ensures that the payment status for the given order is loaded. It results Order object or None if not found."""
    order = await read_order_from_db(session, order_id)
    if not order:
        raise OrderNotFoundException(order_id=order_id)

    if not order.payment:
        return order

    updated_payment = await verify_payment_status(order.payment)
    if not updated_payment:
        return order
    session.add(updated_payment)
    await session.commit()
    await session.refresh(updated_payment)

    return order


async def ensure_payment_created(session: DBSession, order: Order, user: User, continue_url: str) -> Payment:
    """Ensure that payment is created at provider's service and stored in DB within unique IDs."""
    result = await create_payment_at_provider(order=order, email=user.email, continue_url=continue_url)

    new_payment = await create_payment_for_order_in_db(session=session, order_id=order.get_order_id(), external_payment_id=result['paymentId'], status=result['status'], url=result['redirectUrl'])
    return new_payment
