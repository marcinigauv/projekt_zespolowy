from src.sql.models import User
from src.sql.db import DBSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from src.users.exceptions import UserAlreadyExistsException
from typing import Optional


async def create_new_user_in_db(user_to_create: User, db: DBSession) -> User:
    """Creates a new user instance from the provided user creation data."""
    new_user = User.model_validate(user_to_create)
    db.add(new_user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise UserAlreadyExistsException(email=user_to_create.email)
    await db.refresh(new_user)
    return new_user


async def verify_user_credentials_in_db(email: str, password: str, db: DBSession) -> Optional[User]:
    """Verifies user credentials and returns the user if valid."""
    try:
        stmt = select(User).where(User.email == email)  # type: ignore
        user = await db.execute(stmt)  # type: ignore
        user = user.scalar_one_or_none()
        if user:
            return user
    except Exception as e:
        raise e
    return None


async def get_user_details_from_db_by_id(user_id: int, db: DBSession) -> Optional[User]:
    """Fetches user details by user ID."""
    try:
        stmt = select(User).where(User.id == user_id)  # type: ignore
        user = await db.execute(stmt)  # type: ignore
        return user.scalar_one_or_none()
    except Exception as _exc:
        return None


async def update_user_preferences_in_db(user_id: int, preferences: dict[str, str], db: DBSession) -> User:
    """Persists the provided user preferences for a specific user."""
    user = await get_user_details_from_db_by_id(user_id, db)

    if user is None:
        raise RuntimeError(f"User with id '{user_id}' not found.")

    user.user_preferences = preferences
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def update_user_password_in_db(user: User, hashed_password: str, db: DBSession) -> None:
    """Persists a new hashed password for the given user."""
    user.password = hashed_password
    db.add(user)
    await db.flush()
