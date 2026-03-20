from fastapi.responses import JSONResponse
from fastapi import Request


class CustomUserException(Exception):
    """Base class for user-related exceptions."""

    def __init__(self, message: str, status_code: int = 400, *args: object) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message, *args)


async def handle_custom_user_exception(request: Request, exc: Exception) -> JSONResponse:
    """Handles custom user exceptions and returns appropriate HTTP responses."""
    if isinstance(exc, CustomUserException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )
    raise RuntimeError("Unhandled exception type") from exc


class UserAlreadyExistsException(CustomUserException):
    """Exception raised when trying to create a user that already exists."""

    def __init__(self, email: str):
        self.message = f"User with email '{email}' already exists."
        self.status_code = 400
        super().__init__(self.message, self.status_code)


class UserNotFoundException(CustomUserException):
    """Exception raised when a user is not found in the database."""

    def __init__(self, email: str):
        self.message = f"User with email '{email}' not found."
        self.status_code = 404
        super().__init__(self.message, self.status_code)


class NotAuthenticatedException(CustomUserException):
    """Exception raised when a user is not authenticated."""

    def __init__(self):
        self.message = "User is not authenticated."
        self.status_code = 401
        super().__init__(self.message, self.status_code)


class InvalidCredentialsException(CustomUserException):
    """Exception raised when user credentials are invalid."""

    def __init__(self):
        self.message = "Invalid email or password."
        self.status_code = 401
        super().__init__(self.message, self.status_code)
