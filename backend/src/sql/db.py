from src.sql.models import *
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Self, Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession as SQLModelAsyncSession

from src.config import config


class SqlDatabase:

    _instance: Self | None = None

    def __init__(self):
        self.engine: AsyncEngine | None = None
        self.session_factory: async_sessionmaker[SQLModelAsyncSession] | None = None

    @classmethod
    def get(cls) -> Self:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_engine(self) -> AsyncEngine:
        if self.engine is None:
            self.initialize()

        if self.engine is None:
            raise RuntimeError("Engine initialization failed")

        return self.engine

    def _get_database_url(self) -> str:

        db = config.db_sql_settings

        return (
            f"postgresql+asyncpg://{db.username}:{db.password}@{db.host}:{db.port}/{db.database}"
        )

    def initialize(self) -> None:
        if self.engine is not None:
            return

        url = self._get_database_url()

        self.engine = create_async_engine(
            url,
            echo=False,
            future=True,
            pool_pre_ping=True,
            pool_size=15,
            max_overflow=25,
            pool_timeout=30,
        )

        self.session_factory = async_sessionmaker(
            self.engine,
            class_=SQLModelAsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )

    async def shutdown(self) -> None:
        if self.engine is not None:
            await self.engine.dispose()
            self.engine = None
            self.session_factory = None

    async def get_session(self) -> AsyncGenerator[SQLModelAsyncSession, None]:
        if self.session_factory is None:
            raise RuntimeError(
                "Database was not properly initialized. Call SqlDatabase.initialize()")

        session = self.session_factory()

        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

    async def create_all_tables(self) -> None:
        engine = self.get_engine()

        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)

    @asynccontextmanager
    async def lifespan(self):
        self.initialize()
        await self.create_all_tables()
        yield
        await self.shutdown()


db = SqlDatabase.get()
DBSession = Annotated[SQLModelAsyncSession, Depends(db.get_session)]
