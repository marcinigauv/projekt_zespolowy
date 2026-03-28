from fastapi.responses import JSONResponse
from fastapi import Request


class CustomOrderException(Exception):
    """Base class for order-related exceptions."""

    def __init__(self, message: str, status_code: int = 400, *args: object) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message, *args)


async def handle_custom_order_exception(request: Request, exc: Exception) -> JSONResponse:
    """Handles custom order exceptions and returns appropriate HTTP responses."""
    if isinstance(exc, CustomOrderException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )
    raise RuntimeError("Unhandled exception type") from exc


class OrderNotFoundException(CustomOrderException):
    """Exception raised when an order is not found in the database."""

    def __init__(self, order_id: int):
        self.message = f"Order with id '{order_id}' not found."
        self.status_code = 404
        super().__init__(self.message, self.status_code)


class NoAccessToOrderException(CustomOrderException):
    """Exception raised when a user tries to access an order they do not have permission to view."""

    def __init__(self, order_id: int):
        self.message = f"You do not have access to order with id '{order_id}'."
        self.status_code = 403
        super().__init__(self.message, self.status_code)


class InsufficientStockException(CustomOrderException):
    """Exception raised when there is insufficient stock for a product in an order."""

    def __init__(self, product_id: int, requested_quantity: int, available_quantity: int):
        self.message = (
            f"Insufficient stock for product with id '{product_id}'. "
            f"Requested quantity: {requested_quantity}, available quantity: {available_quantity}."
        )
        self.status_code = 400
        super().__init__(self.message, self.status_code)


class BadCreateOrderRequestException(CustomOrderException):
    """Exception raised when the create order request is invalid."""

    def __init__(self, message: str):
        self.message = message
        self.status_code = 400
        super().__init__(self.message, self.status_code)
