from fastapi import APIRouter, Query
from src.sql.db import DBSession
from src.products.use_cases import get_products, get_product_by_id
from typing import Annotated
from src.products.models import ProductResponse, ProductSearchRequest


products_router = APIRouter(prefix="/products", tags=["products"])


@products_router.post("/", response_model=list[ProductResponse])
async def list_products_post(search_request: ProductSearchRequest, session: DBSession) -> list[ProductResponse]:
    """Endpoint to get a paginated list of products with optional filters."""
    return await get_products(search_request, session)


@products_router.get("/", response_model=ProductResponse)
async def get_product_get(
    session: DBSession,
    product_id: int = Query(
        description="The unique identifier of the product", default=1)
) -> ProductResponse:
    """Endpoint to get a product by its ID."""
    return await get_product_by_id(session, product_id)
