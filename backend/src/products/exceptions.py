from fastapi.responses import JSONResponse
from fastapi import Request


class CustomProductException(Exception):
    """Base class for product-related exceptions."""

    def __init__(self, message: str, status_code: int = 400, *args: object) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message, *args)


async def handle_custom_product_exception(request: Request, exc: Exception) -> JSONResponse:
    """Handles custom product exceptions and returns appropriate HTTP responses."""
    if isinstance(exc, CustomProductException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )
    raise RuntimeError("Unhandled exception type") from exc


class ProductNotFoundException(CustomProductException):
    """Exception raised when a product is not found in the database."""

    def __init__(self, product_id: int):
        self.message = f"Product with id '{product_id}' not found."
        self.status_code = 404
        super().__init__(self.message, self.status_code)
