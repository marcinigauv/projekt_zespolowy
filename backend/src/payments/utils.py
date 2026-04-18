from src.config import config
from src.sql.models import Payment, Order
from src.sql.db import DBSession
from src.payments.exceptions import PaymentNotAvailableException
from json import loads, dumps
from typing import Optional, Any
import httpx
from src.payments.enums import PaymentStatus
from sqlmodel import select
from sqlalchemy.orm import selectinload
import random
import hmac
import hashlib
import base64
import uuid
import string


def generate_payment_id() -> str:
    """Generates a unique payment ID."""
    return str(int(uuid.uuid4()))


def calculate_hmac(data: bytes, key: bytes) -> bytes:
    """Calculates HMAC signature for the given data using the provided key."""
    hashed_object = hmac.new(key, data, hashlib.sha256).digest()
    return base64.b64encode(hashed_object)


def generate_random_string(length: int = 16) -> str:
    """Generates a random string of specified length."""
    return ''.join(random.choices(string.ascii_letters, k=length))


async def verify_payment_status(payment: Payment) -> Payment:
    """Verifies the status of a payment with the external provider and updates object in memory. Does not update DB."""
    payment_id = payment.external_id
    headers: dict[str, str] = {}
    headers['Api-Key'] = config.payments_settings.api_key
    url = f"{config.payments_settings.provider_url}/{payment_id}/status"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    if response.status_code != 200:
        raise PaymentNotAvailableException()

    response_dict = loads(response.text)
    payment.status = response_dict['status']
    return payment


async def create_payment_for_order_in_db(session: DBSession, order_id: int, external_payment_id: str, url: str, status: str = PaymentStatus.NEW.value) -> Payment:
    """Creates or updates a payment record in the database for the given order ID. Does not create payment at provider."""
    statement = select(Payment).where(Payment.order_id == order_id)
    result = await session.exec(statement)
    existing_payment: Payment | None = result.one_or_none()

    if existing_payment:
        # Aktualizuj istniejącą płatność
        existing_payment.external_id = external_payment_id
        existing_payment.url = url
        existing_payment.status = status
        payment = existing_payment
    else:
        # Utwórz nową płatność
        payment = Payment(
            external_id=external_payment_id,
            url=url,
            status=status,
            order_id=order_id
        )
        session.add(payment)

    await session.commit()
    await session.refresh(payment)
    return payment


async def create_payment_at_provider(order: Order, email: str, continue_url: str) -> Any:
    """Makes API call to initiate payment at the provider and returns external payment ID."""
    uniqe_id: str = generate_payment_id()
    data: dict[str, Any] = {
        "amount": str(int(order.total_amount * 100)),
        "externalId": uniqe_id,
        "description": f"Opłata za realizację zamówienia {order.id} przez {email}.",
        "buyer": {
            "email": f"{email}"
        },
        "continueUrl": continue_url
    }
    payment_object = dumps(data, indent=4)
    signature = calculate_hmac(
        payment_object.encode(), config.payments_settings.sign_phrase.encode()).decode()
    headers: dict[str, str] = {}
    headers['Api-Key'] = config.payments_settings.api_key
    headers['Signature'] = signature
    headers['Idempotency-Key'] = generate_random_string(length=45)
    headers['Host'] = 'api.sandbox.paynow.pl'
    headers["Content-Type"] = "application/json"
    async with httpx.AsyncClient() as client:
        response = await client.post(url=config.payments_settings.provider_url, headers=headers, data=payment_object)
    if response.status_code == 201:
        response_dict = loads(response.text)
        return response_dict
    raise PaymentNotAvailableException()


async def read_payment_from_db(session: DBSession, payment_id: int) -> Optional[Payment]:
    """Reads a payment record from the database by its ID."""
    payment = await session.get(Payment, payment_id)
    return payment


async def read_order_from_db(session: DBSession, order_id: int) -> Optional[Order]:
    """Reads an order record from the database by its ID."""
    statement = select(Order).options(
        selectinload(Order.items),
        selectinload(Order.payment),
    ).where(Order.id == order_id)
    result = await session.exec(statement)
    return result.one_or_none()
