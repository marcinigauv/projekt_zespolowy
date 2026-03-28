from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from pydantic.alias_generators import to_camel
from decimal import Decimal
from src.products.models import ProductResponse
from src.orders.exceptions import BadCreateOrderRequestException
from typing import Optional


class BaseRequestModel(BaseModel):
    model_config = ConfigDict(from_attributes=True,
                              alias_generator=to_camel, populate_by_name=True)


class ProductInfoRequest(BaseRequestModel):
    product_id: int = Field(
        description="The unique identifier of the product", ge=1)
    quantity: int = Field(
        description="The quantity of the product in the order", ge=1)


class ListOrdersRequest(BaseRequestModel):
    page: int = Field(
        description="The page number for pagination", ge=1, default=1)
    page_size: int = Field(
        description="The number of items per page for pagination", ge=1, le=100, default=10)


class CreateOrderRequest(BaseRequestModel):
    products: list[ProductInfoRequest] = Field(
        description="The list of products and their quantities in the order")

    @field_validator("products")
    def validate_products(cls, products: list[ProductInfoRequest]) -> list[ProductInfoRequest]:
        if not products:
            raise BadCreateOrderRequestException(
                "Products list cannot be empty")
        ids: set[int] = set()
        for product in products:
            if product.product_id in ids:
                raise BadCreateOrderRequestException(
                    f"Duplicate productId: {product.product_id} in products list")
            ids.add(product.product_id)
        return products


class PaymentResponse(BaseRequestModel):
    id: int = Field(description="The unique identifier of the payment", ge=1)
    status: str = Field(description="The status of the payment", min_length=1)


class OrderDetailResponse(BaseRequestModel):
    id: int = Field(
        description="The unique identifier of the order detail", ge=1)
    quantity: int = Field(
        description="The quantity of the product in the order", ge=1)
    unit_price: Decimal = Field(
        description="The unit price of the product in the order", gt=0)
    product: ProductResponse = Field(
        description="The product in the order detail")


class OrderResponse(BaseRequestModel):
    id: int = Field(description="The unique identifier of the order", ge=1)
    customer_id: int = Field(
        description="The unique identifier of the customer who made the order", ge=1)
    order_date: datetime = Field(
        description="The date and time when the order was made")
    total_amount: Decimal = Field(description="The total amount of the order")
    items: list[OrderDetailResponse] = Field(
        description="The list of order details in the order")
    payment: Optional[PaymentResponse] = Field(default=None,
                                               description="The payment information for the order")
