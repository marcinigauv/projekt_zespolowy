from fastapi.responses import JSONResponse
from fastapi import Request


class CustomPaymentException(Exception):
    """Base class for payment-related exceptions."""

    def __init__(self, message: str, status_code: int = 400, *args: object) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message, *args)


async def handle_custom_payment_exception(request: Request, exc: Exception) -> JSONResponse:
    """Handles custom payment exceptions and returns appropriate HTTP responses."""
    if isinstance(exc, CustomPaymentException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )
    raise RuntimeError("Unhandled exception type") from exc


class PaymentNotFoundException(CustomPaymentException):
    """Raised when a payment is not found in the database."""

    def __init__(self, message: str = "Payment not found."):
        super().__init__(message, status_code=404)


class PaymentNotAvailableException(CustomPaymentException):
    """Raised when the payment provider is unavailable."""

    def __init__(self, message: str = "Payment provider is currently unavailable. Please try again later."):
        super().__init__(message, status_code=503)


class PaymentDoesNotExistException(CustomPaymentException):
    """Raised when a payment with the specified ID does not exist."""

    def __init__(self, message: str = "Payment with the specified ID does not exist."):
        super().__init__(message, status_code=404)


class PaymentAlreadyCreatedException(CustomPaymentException):
    """Raised when a payment for the order already exists."""

    def __init__(self, message: str = "A payment for this order already exists."):
        super().__init__(message, status_code=400)
