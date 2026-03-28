from src.sql.models import User
from src.users.models import UserCreate
from src.sql.db import DBSession
from src.users.utils import create_new_user_in_db, verify_user_credentials_in_db
from src.users.helpers import hash_password, verify_password
from typing import Optional


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
    pass
    if not user or not verify_password(password, user.password):
        return None

    return user
