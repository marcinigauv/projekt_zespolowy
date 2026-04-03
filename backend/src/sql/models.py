from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import String, Column
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class BaseTableModel(SQLModel):
    """Base model for all tables to inherit from, providing common configurations."""
    __abstract__ = True

    def get_id(self) -> int:
        """Utility method to get the ID of the record."""
        if not hasattr(self, 'id') or getattr(self, 'id') is None:
            raise ValueError("ID is not set")
        return getattr(self, 'id')


class User(BaseTableModel, table=True):
    id: Optional[int] = Field(primary_key=True,
                              unique=True, index=True, default=None)
    name: str = Field(description="The name of the user", min_length=1)
    surname: str = Field(description="The surname of the user", min_length=1)
    email: str = Field(
        description="The email of the user", min_length=1, unique=True, index=True)
    password: str = Field(
        description="The hash of password of the user", min_length=1, exclude=True)

    def get_user_id(self) -> int:
        """Utility method to get the user's ID."""
        return self.get_id()


class Product(BaseTableModel, table=True):
    id: Optional[int] = Field(primary_key=True,
                              unique=True, index=True, default=None)
    name: str = Field(description="The name of the product", min_length=1)
    description: str = Field(
        description="The description of the product", min_length=1)
    categories: List[str] = Field(sa_column=Column(ARRAY(String)))
    price: Decimal = Field(description="The price of the product", gt=0)
    amount: int = Field(description="The amount of the product in stock", ge=0)


class Order(BaseTableModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="user.id")
    order_date: datetime = Field(default_factory=datetime.now)
    total_amount: Decimal = Field(
        default=Decimal("0"),
        description="The total amount of the order after discounts",
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    items: List["OrderDetail"] = Relationship(
        back_populates="order", sa_relationship_kwargs={"lazy": "selectin"})
    payment: Optional["Payment"] = Relationship(
        back_populates="order", sa_relationship_kwargs={"lazy": "selectin"})

    def get_order_id(self) -> int:
        """Utility method to get the order's ID."""
        if not self.id:
            raise ValueError("Order ID is not set")
        return self.id


class OrderDetail(BaseTableModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quantity: int = Field(
        description="The quantity of the product in the order", ge=1)
    unit_price: Decimal = Field(
        description="The unit price of the product in the order", gt=0)

    order_id: int = Field(foreign_key="order.id")
    product_id: int = Field(foreign_key="product.id")
    order: Order = Relationship(back_populates="items")
    product: Product = Relationship()


class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    external_id: str = Field(
        description="The external ID from the payment provider", min_length=1)
    url: Optional[str] = Field(
        description="The URL to the payment page at the provider")
    status: str = Field(description="The status of the payment", min_length=1)
    order_id: int = Field(foreign_key="order.id")
    order: "Order" = Relationship(back_populates="payment")
