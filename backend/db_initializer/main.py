import argparse
import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import select, text

from src.products.models import ProductCreateRequest
from src.sql.db import db
from src.sql.models import Product, User
from src.users.helpers import hash_password


DATA_DIR = Path(__file__).resolve().parent / "data"
INIT_STATUS_TABLE = "init_status"
INIT_EVENTS = ("feed_users", "feed_products")
LOCK_KEY = 2404232026


class SeedUser(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    surname: str
    email: EmailStr
    password: str
    is_admin: bool


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_seed_users() -> list[SeedUser]:
    raw_users = load_json(DATA_DIR / "users.json")
    return [SeedUser.model_validate(item) for item in raw_users]


def load_seed_products() -> list[ProductCreateRequest]:
    raw_products = load_json(DATA_DIR / "products.json")
    return [ProductCreateRequest.model_validate(item) for item in raw_products]


async def init_status_table_exists(session) -> bool:
    result = await session.execute(
        text(f"SELECT to_regclass('public.{INIT_STATUS_TABLE}')")
    )
    return result.scalar_one() is not None


async def ensure_init_status_table(session) -> None:
    await session.execute(
        text(
            f"""
            CREATE TABLE IF NOT EXISTS {INIT_STATUS_TABLE} (
                name TEXT PRIMARY KEY,
                confirmed BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                error_message TEXT NULL
            )
            """
        )
    )
    await session.commit()


async def ensure_init_status_rows(session) -> None:
    for event_name in INIT_EVENTS:
        await session.execute(
            text(
                f"""
                INSERT INTO {INIT_STATUS_TABLE} (name, confirmed, created_at, updated_at, error_message)
                VALUES (:name, FALSE, NOW(), NOW(), NULL)
                ON CONFLICT (name) DO NOTHING
                """
            ),
            {"name": event_name},
        )
    await session.commit()


async def get_init_statuses(session) -> dict[str, dict[str, Any]]:
    if not await init_status_table_exists(session):
        return {}

    result = await session.execute(
        text(
            f"""
            SELECT name, confirmed, created_at, updated_at, error_message
            FROM {INIT_STATUS_TABLE}
            ORDER BY name
            """
        )
    )
    rows = result.mappings().all()
    return {
        row["name"]: {
            "confirmed": row["confirmed"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "error_message": row["error_message"],
        }
        for row in rows
    }


async def is_event_confirmed(session, event_name: str) -> bool:
    if not await init_status_table_exists(session):
        return False

    result = await session.execute(
        text(
            f"SELECT confirmed FROM {INIT_STATUS_TABLE} WHERE name = :name"
        ),
        {"name": event_name},
    )
    confirmed = result.scalar_one_or_none()
    return bool(confirmed)


async def mark_event_success(session, event_name: str) -> None:
    await session.execute(
        text(
            f"""
            UPDATE {INIT_STATUS_TABLE}
            SET confirmed = TRUE,
                updated_at = NOW(),
                error_message = NULL
            WHERE name = :name
            """
        ),
        {"name": event_name},
    )
    await session.commit()


async def mark_event_failure(session, event_name: str, error_message: str) -> None:
    await session.execute(
        text(
            f"""
            UPDATE {INIT_STATUS_TABLE}
            SET confirmed = FALSE,
                updated_at = NOW(),
                error_message = :error_message
            WHERE name = :name
            """
        ),
        {"name": event_name, "error_message": error_message[:2000]},
    )
    await session.commit()


async def acquire_lock(session) -> None:
    await session.execute(
        text("SELECT pg_advisory_lock(:lock_key)"),
        {"lock_key": LOCK_KEY},
    )


async def release_lock(session) -> None:
    await session.execute(
        text("SELECT pg_advisory_unlock(:lock_key)"),
        {"lock_key": LOCK_KEY},
    )


async def get_existing_user_emails(session, seed_users: list[SeedUser]) -> set[str]:
    emails = [str(user.email) for user in seed_users]
    if not emails:
        return set()

    result = await session.execute(select(User.email).where(User.email.in_(emails)))
    return {email for email in result.scalars().all()}


async def get_existing_product_keys(session) -> set[tuple[str, str]]:
    result = await session.execute(select(Product.name, Product.description))
    return set(result.all())


async def build_report(session, seed_users: list[SeedUser], seed_products: list[ProductCreateRequest]) -> dict[str, Any]:
    existing_user_emails = await get_existing_user_emails(session, seed_users)
    existing_product_keys = await get_existing_product_keys(session)
    admin_users = [user for user in seed_users if user.is_admin]
    non_admin_users = [user for user in seed_users if not user.is_admin]
    existing_seed_admins = [str(user.email) for user in admin_users if str(
        user.email) in existing_user_emails]
    matching_products = sum(
        1
        for product in seed_products
        if (product.name, product.description) in existing_product_keys
    )
    return {
        "init_status_table_exists": await init_status_table_exists(session),
        "events": await get_init_statuses(session),
        "users": {
            "total": len(seed_users),
            "admins": len(admin_users),
            "non_admins": len(non_admin_users),
            "existing_seed_admin_emails": existing_seed_admins,
            "existing_seed_users": len(existing_user_emails),
        },
        "products": {
            "total": len(seed_products),
            "existing_seed_products": matching_products,
        },
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }


async def apply_users(session, seed_users: list[SeedUser]) -> dict[str, Any]:
    existing_user_emails = await get_existing_user_emails(session, seed_users)
    inserted = 0

    for seed_user in seed_users:
        email = str(seed_user.email)
        if email in existing_user_emails:
            continue

        session.add(
            User(
                name=seed_user.name,
                surname=seed_user.surname,
                email=email,
                password=hash_password(seed_user.password),
                is_admin=seed_user.is_admin,
            )
        )
        existing_user_emails.add(email)
        inserted += 1

    await session.commit()
    return {
        "inserted": inserted,
        "skipped_existing": len(seed_users) - inserted,
    }


async def apply_products(session, seed_products: list[ProductCreateRequest]) -> dict[str, Any]:
    existing_product_keys = await get_existing_product_keys(session)
    inserted = 0

    for seed_product in seed_products:
        product_key = (seed_product.name, seed_product.description)
        if product_key in existing_product_keys:
            continue

        session.add(Product.model_validate(seed_product.model_dump()))
        existing_product_keys.add(product_key)
        inserted += 1

    await session.commit()
    return {
        "inserted": inserted,
        "skipped_existing": len(seed_products) - inserted,
    }


async def run_event(session, event_name: str, handler) -> dict[str, Any]:
    if await is_event_confirmed(session, event_name):
        return {"state": "skipped", "reason": "already_confirmed"}

    try:
        result = await handler(session)
    except Exception as exc:
        await session.rollback()
        await mark_event_failure(session, event_name, str(exc))
        return {"state": "failed", "error": str(exc)}

    await mark_event_success(session, event_name)
    return {"state": "applied", **result}


def print_report(report: dict[str, Any]) -> None:
    print(json.dumps(report, indent=2, default=str))


async def main_async(mode: str) -> int:
    seed_users = load_seed_users()
    seed_products = load_seed_products()
    db.initialize()

    if db.session_factory is None:
        raise RuntimeError("Database session factory is not initialized")

    async with db.session_factory() as session:
        await acquire_lock(session)

        try:
            if mode == "apply":
                await ensure_init_status_table(session)
                await ensure_init_status_rows(session)

            if mode in {"dry-run", "status"}:
                report = await build_report(session, seed_users, seed_products)
                report["mode"] = mode
                print_report(report)
                return 0

            results = {
                "feed_users": await run_event(session, "feed_users", lambda current_session: apply_users(current_session, seed_users)),
                "feed_products": await run_event(session, "feed_products", lambda current_session: apply_products(current_session, seed_products)),
            }
            report = await build_report(session, seed_users, seed_products)
            report["mode"] = mode
            report["results"] = results
            print_report(report)
            return 1 if any(result["state"] == "failed" for result in results.values()) else 0
        finally:
            await release_lock(session)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "mode",
        nargs="?",
        choices=["dry-run", "apply", "status"],
        default="dry-run",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    raise SystemExit(asyncio.run(main_async(args.mode)))


if __name__ == "__main__":
    main()
