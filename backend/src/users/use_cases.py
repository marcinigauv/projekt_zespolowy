from src.sql.models import User
from src.users.models import UserCreate
from src.sql.db import DBSession
from src.users.utils import create_new_user_in_db, verify_user_credentials_in_db, update_user_preferences_in_db, get_user_details_from_db_by_id, update_user_password_in_db
from src.users.helpers import hash_password, verify_password
from src.users.exceptions import InvalidCurrentPasswordException, PasswordMismatchException
from typing import Optional


ALLOWED_THEME_PREFERENCES = {
    "stitchLuxeLight",
    "stitchLuxeDark",
    "stitchInception",
    "stitchCyberpunk",
    "stitchMatrix",
    "stitchStarWars",
    "stitchHarryPotter",
    "stitchLotr",
    "stitchNoir",
    "stitchSynthwave",
}


async def create_new_user(user_create: UserCreate, db: DBSession) -> User:
    """Creates a new user in the database."""
    password = user_create.password.get_secret_value()
    hashed_password = hash_password(password)
    user_to_create = User.model_validate(
        {**user_create.model_dump(), "password": hashed_password})
    created_user = await create_new_user_in_db(user_to_create, db)
    return created_user


async def verify_user_credentials(email: str, password: str, db: DBSession) -> Optional[User]:
    """Verifies user credentials and returns the user if valid."""
    user = await verify_user_credentials_in_db(email, password, db)
    if not user or not verify_password(password, user.password):
        return None

    return user


async def update_user_preferences(user_id: int, theme: str, db: DBSession) -> User:
    """Updates persisted user preferences for a specific user."""
    normalized_theme = theme.strip()

    if normalized_theme not in ALLOWED_THEME_PREFERENCES:
        raise ValueError("Invalid theme preference.")

    return await update_user_preferences_in_db(
        user_id,
        {"theme": normalized_theme},
        db,
    )


async def change_user_password(
    user_id: int,
    current_password: str,
    new_password: str,
    confirm_new_password: str,
    db: DBSession,
) -> None:
    """Verifies the current password and updates it with a new hashed password."""
    user = await get_user_details_from_db_by_id(user_id, db)
    if user is None:
        raise RuntimeError(f"User with id '{user_id}' not found.")

    if not verify_password(current_password, user.password):
        raise InvalidCurrentPasswordException()

    if new_password != confirm_new_password:
        raise PasswordMismatchException()

    hashed = hash_password(new_password)
    await update_user_password_in_db(user, hashed, db)
