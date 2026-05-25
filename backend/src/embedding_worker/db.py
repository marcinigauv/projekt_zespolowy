from typing import AsyncGenerator, Self

from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession as SQLModelAsyncSession

from src.embedding_worker.config import config


class EmbeddingWorkerDatabase:

    _instance: Self | None = None

    def __init__(self):
        self.engine: AsyncEngine | None = None
        self.session_factory: async_sessionmaker[SQLModelAsyncSession] | None = None

    @classmethod
    def get(cls) -> Self:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _get_database_url(self) -> str:
        db_settings = config.db_sql_settings
        return (
            f"postgresql+asyncpg://{db_settings.username}:{db_settings.password}"
            f"@{db_settings.host}:{db_settings.port}/{db_settings.database}"
        )

    def initialize(self) -> None:
        if self.engine is not None:
            return

        self.engine = create_async_engine(
            self._get_database_url(),
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
                "Database was not properly initialized. Call EmbeddingWorkerDatabase.initialize()"
            )

        session = self.session_factory()

        try:
            yield session
        finally:
            await session.close()


db = EmbeddingWorkerDatabase.get()