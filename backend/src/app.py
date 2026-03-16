from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
from src.sql.db import db, DBSession


@asynccontextmanager
async def app_lifespan(app: FastAPI):
    async with db.lifespan():
        yield

app = FastAPI(lifespan=app_lifespan)


@app.get('/healthcheck', response_model=bool)
async def healthcheck(session: DBSession) -> bool:
    """Endpoint to get health SQL DB check status."""
    result = await session.execute(text("SELECT 1"))  # type: ignore
    return result.scalar_one() == 1
