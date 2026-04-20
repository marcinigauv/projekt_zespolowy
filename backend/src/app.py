from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy import text
from src.sql.db import db, DBSession
from src.notifications.router import notifications_router
from src.orders.router import orders_router
from src.payments.router import payments_router
from src.products.router import products_router
from src.users.router import users_router
from src.orders.exceptions import CustomOrderException, handle_custom_order_exception
from src.products.exceptions import CustomProductException, handle_custom_product_exception
from src.users.exceptions import CustomUserException, handle_custom_user_exception
from src.payments.exceptions import CustomPaymentException, handle_custom_payment_exception
from src.vector_store.sync import sync_missing_products_to_vector_store
import asyncio

origins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8081",
]  # Developerska konfuguracja CORS


@asynccontextmanager
async def app_lifespan(app: FastAPI):
    async with db.lifespan():
        task = asyncio.create_task(
            sync_missing_products_to_vector_store())

        try:
            yield
        finally:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass


app = FastAPI(lifespan=app_lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notifications_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(products_router)
app.include_router(users_router)

app.add_exception_handler(CustomProductException,
                          handle_custom_product_exception)
app.add_exception_handler(CustomUserException,
                          handle_custom_user_exception)
app.add_exception_handler(CustomOrderException,
                          handle_custom_order_exception)
app.add_exception_handler(CustomPaymentException,
                          handle_custom_payment_exception)

app.add_middleware(SessionMiddleware, secret_key="your_secret_key_here")


@app.get('/healthcheck', response_model=bool)
async def healthcheck(session: DBSession) -> bool:
    """Endpoint to get health SQL DB check status."""
    result = await session.execute(text("SELECT 1"))  # type: ignore
    return result.scalar_one() == 1
