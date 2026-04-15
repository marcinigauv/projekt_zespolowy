from fastapi import APIRouter, Depends, Query
from src.sql.db import DBSession
from src.products.use_cases import add_product, delete_product, edit_product, get_products, get_product_by_id, get_similar_products_by_product_id
from src.products.models import ProductCreateRequest, ProductResponse, ProductSearchRequest, ProductUpdateRequest
from src.sql.models import User
from src.users.dependecies import require_admin


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


@products_router.get("/similar", response_model=list[ProductResponse])
async def get_similar_products_get(
    session: DBSession,
    product_id: int = Query(
        description="The unique identifier of the product to find similar products for", default=1)
) -> list[ProductResponse]:
    """Endpoint to get similar products to a given product ID."""
    return await get_similar_products_by_product_id(session, product_id)


@products_router.post("/add", response_model=ProductResponse)
async def add_product_post(
    product_request: ProductCreateRequest,
    session: DBSession,
    user: User = Depends(require_admin),
) -> ProductResponse:
    return await add_product(session, product_request)


@products_router.put("/{product_id}", response_model=ProductResponse)
async def edit_product_put(
    product_id: int,
    product_request: ProductUpdateRequest,
    session: DBSession,
    user: User = Depends(require_admin),
) -> ProductResponse:
    return await edit_product(session, product_id, product_request)


@products_router.delete("/{product_id}", response_model=bool)
async def delete_product_delete(
    product_id: int,
    session: DBSession,
    user: User = Depends(require_admin),
) -> bool:
    return await delete_product(session, product_id)
