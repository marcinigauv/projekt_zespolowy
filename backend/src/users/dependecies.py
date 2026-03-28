from fastapi import Request
from src.sql.models import User
from src.sql.db import DBSession
from src.users.exceptions import NotAuthenticatedException
from src.users.utils import get_user_details_from_db_by_id


def get_session_user(request: Request) -> User:
    """Dependency to retrieve the current authenticated user from the request."""
    try:
        user = request.session["user"]
        return User.model_validate({**user, "password": "placeholder"})
    except KeyError:
        raise NotAuthenticatedException


def set_session_user(request: Request, user: User) -> None:
    """Utility function to set the current authenticated user in the session."""
    request.session["user"] = user.model_dump(exclude={"password"})


def clear_session(request: Request) -> None:
    """Utility function to clear the user session."""
    request.session.pop("user", None)


async def require_authentication(request: Request, session: DBSession) -> User:
    """Dependency to ensure the user is authenticated and retrieve their details."""
    session_user: User = get_session_user(request)
    user_id = session_user.get_user_id()
    user = await get_user_details_from_db_by_id(user_id, session)
    if not user:
        clear_session(request)
        raise NotAuthenticatedException
    return user
