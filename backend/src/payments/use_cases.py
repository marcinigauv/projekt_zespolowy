from src.sql.db import DBSession
from src.sql.models import Payment, User
from src.orders.exceptions import NoAccessToOrderException
from src.payments.enums import PaymentStatus
from src.payments.dependencies import ensure_order_payment_status_loaded, ensure_payment_created
from src.payments.exceptions import PaymentNotFoundException


async def get_payment_for_order_and_user(session: DBSession, order_id: int, user_id: int) -> Payment:
    """Check the payment status of an order. It returns updated payment object or raises PaymentNotFoundException if the order or payment is not found."""
    order = await ensure_order_payment_status_loaded(session, order_id)
    if order is None:
        raise PaymentNotFoundException

    if order.customer_id != user_id:
        raise NoAccessToOrderException(order_id=order_id)

    if not order or order.payment is None:
        raise PaymentNotFoundException

    return order.payment


async def create_payment_for_order(session: DBSession, order_id: int, user: User) -> Payment:
    """Create a payment for an order. It returns created payment object or raises PaymentNotFoundException if the order is not found."""
    order = await ensure_order_payment_status_loaded(session, order_id)
    user_id = user.get_user_id()
    if order is None:
        raise PaymentNotFoundException

    if order.customer_id != user_id:
        raise NoAccessToOrderException(order_id=order_id)

    if order.payment and order.payment.status not in [PaymentStatus.EXPIRED, PaymentStatus.ABANDONED]:
        # If payemnt already exists and is not in final state, return it
        return order.payment

    result = await ensure_payment_created(session, order, user)
    return result
