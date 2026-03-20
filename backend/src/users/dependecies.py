from fastapi import Request
from src.users.models import User
from src.users.exceptions import NotAuthenticatedException


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
