import asyncio
import os

from src.embedding_worker.db import db
from src.embedding_worker.products import get_product_batch
from src.embedding_worker.vector_store import get_embedding_worker_vector_store


DEFAULT_INITIAL_DELAY_SECONDS = 15
DEFAULT_INTERVAL_SECONDS = 900
DEFAULT_PAGE_SIZE = 100


def get_env_int(name: str, default: int, *, minimum: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None or not raw_value.strip():
        return default

    value = int(raw_value)
    if value < minimum:
        raise ValueError(f"{name} must be >= {minimum}")

    return value


async def rebuild_vector_store_once(page_size: int) -> int:
    session_generator = db.get_session()
    session = await anext(session_generator)

    try:
        repo = get_embedding_worker_vector_store()
        repo.reset_collection()
        rebuilt_products = 0
        page = 0

        while True:
            products = await get_product_batch(
                session=session,
                page_size=page_size,
                page=page,
            )

            if not products:
                break

            for product in products:
                repo.upsert(product)

            rebuilt_products += len(products)
            page += 1

        return rebuilt_products
    finally:
        await session_generator.aclose()


async def run_forever() -> None:
    page_size = get_env_int(
        "EMBEDDING_WORKER_PAGE_SIZE",
        DEFAULT_PAGE_SIZE,
        minimum=1,
    )
    initial_delay_seconds = get_env_int(
        "EMBEDDING_WORKER_INITIAL_DELAY_SECONDS",
        DEFAULT_INITIAL_DELAY_SECONDS,
        minimum=0,
    )
    interval_seconds = get_env_int(
        "EMBEDDING_WORKER_INTERVAL_SECONDS",
        DEFAULT_INTERVAL_SECONDS,
        minimum=1,
    )

    db.initialize()

    if initial_delay_seconds:
        print(
            f"Embedding worker sleeping for {initial_delay_seconds} seconds before first rebuild."
        )
        await asyncio.sleep(initial_delay_seconds)

    while True:
        try:
            rebuilt_products = await rebuild_vector_store_once(page_size)
            print(
                f"Embedding worker rebuilt vector store with {rebuilt_products} products."
            )
        except Exception as exc:
            print(f"Embedding worker rebuild failed: {exc}")

        await asyncio.sleep(interval_seconds)


async def main() -> None:
    try:
        await run_forever()
    finally:
        await db.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
