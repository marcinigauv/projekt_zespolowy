from src.products.utils import get_all_products_in_chunks_from_db
from src.vector_store.repo import get_vector_store_repo
from src.sql.db import db
from asyncio import sleep

delay_minutes = 15
delay_time = delay_minutes * 60


async def sync_missing_products_to_vector_store() -> None:
    """Syncs products that are in the SQL database but missing in the Chroma Vector Store."""
    while True:
        try:
            session_gen = db.get_session()
            session = await anext(session_gen)
            repo = get_vector_store_repo()

            page_size = 100
            page = 0

            paginated_response = await get_all_products_in_chunks_from_db(
                session=session,
                page_size=page_size,
                page=page
            )
            products = paginated_response.products

            if not products:
                print(
                    f"No products to sync, sleeping for {delay_minutes} minutes before next check...")
                await sleep(delay=delay_time)

            for product in products:
                repo.ensure_product_exists(product)

            page += 1
            print(
                f"Finished syncing products to vector store, sleeping for {delay_minutes} minutes before next sync...")
            await sleep(delay=delay_time)

        except Exception as _exc:
            print(f"Error during synchronization: {_exc}")
            await sleep(delay=delay_time)
