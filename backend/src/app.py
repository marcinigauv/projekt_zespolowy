from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy import text
from src.sql.db import db, DBSession
from src.users.router import users_router
from src.users.exceptions import CustomUserException, handle_custom_user_exception


@asynccontextmanager
async def app_lifespan(app: FastAPI):
    async with db.lifespan():
        yield

app = FastAPI(lifespan=app_lifespan)


app.include_router(users_router)

app.add_exception_handler(CustomUserException,
                          handle_custom_user_exception)

app.add_middleware(SessionMiddleware, secret_key="your_secret_key_here")


@app.get('/healthcheck', response_model=bool)
async def healthcheck(session: DBSession) -> bool:
    """Endpoint to get health SQL DB check status."""
    result = await session.execute(text("SELECT 1"))  # type: ignore
    return result.scalar_one() == 1
