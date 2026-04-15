from src.sql.models import Product
from pydantic import BaseModel, Field, ConfigDict, field_validator
from pydantic.alias_generators import to_camel
from src.products.enums import ProductCategory, ProductSortingDirection, ProductSortingKey
from typing import Optional


class BaseRequestModel(BaseModel):
    model_config = ConfigDict(from_attributes=True,
                              alias_generator=to_camel, populate_by_name=True)


class ProductSearchRequest(BaseRequestModel):
    limit: int = Field(
        description="The maximum number of products to return", gt=1, default=50)
    offset: int = Field(
        description="The number of products to skip before starting to collect the result set", ge=0, default=0)
    sorting_field: ProductSortingKey | None = Field(
        default=None, description="The field by which to sort the products")
    sorting_order: ProductSortingDirection | None = Field(
        default=None, description="The direction in which to sort the products")
    category: str = Field(description="The category to filter products by")
    substring: str = Field(
        description="A substring to search for in product names", default="")


class BaseResponseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True,
                              alias_generator=to_camel, populate_by_name=True)


class ProductResponse(BaseResponseModel):
    id: int = Field(description="The unique identifier of the product")
    name: str = Field(description="The name of the product")
    description: str = Field(description="The description of the product")
    price: float = Field(description="The price of the product")
    amount: int = Field(description="The amount of the product in stock")
    categories: list[str] = Field(
        description="The categories of the product")
    image_url: Optional[str] = Field(
        description="The URL of the product image")

    @field_validator("categories", mode="before")
    @classmethod
    def map_categories_from_db(cls, value: list[str]) -> list[str]:
        def map_category_from_db(category: str) -> Optional[str]:
            for category_enum in ProductCategory:
                if not category_enum.lower() == category.lower():
                    continue
                return category_enum.value
        results = [map_category_from_db(category) for category in value]
        return [result for result in results if result is not None]

    @classmethod
    def from_product(cls, product: Product) -> "ProductResponse":
        return cls.model_validate(product)


class PaginatedProductsResponse(BaseResponseModel):
    total: int = Field(
        description="The total number of products matching the search criteria")
    products: list[ProductResponse] = Field(
        description="The list of products in the current page")
    page: int = Field(description="The current page number")
    page_size: int = Field(description="The number of products per page")
