from fastapi import APIRouter, Query, Depends, Request
from fastapi.responses import HTMLResponse
from urllib.parse import urlsplit
from src.sql.db import DBSession
from src.sql.models import Payment, User
from src.users.dependecies import require_authentication
from src.payments.use_cases import get_payment_for_order_and_user, create_payment_for_order

payments_router = APIRouter(prefix="/payments", tags=["payments"])


def get_request_origin(request: Request) -> str | None:
    origin = request.headers.get("origin")
    if origin:
        return origin.rstrip("/")

    referer = request.headers.get("referer")
    if not referer:
        return None

    parsed = urlsplit(referer)
    if not parsed.scheme or not parsed.netloc:
        return None

    return f"{parsed.scheme}://{parsed.netloc}"


@payments_router.get("/status", response_model=Payment)
async def check_payment_get(
    session: DBSession,
    order_id: int = Query(
        description="The unique identifier of the order to check payment status for", default=1),
    user: User = Depends(require_authentication)
) -> Payment:
    """Endpoint to check the payment status of an order."""
    payment = await get_payment_for_order_and_user(session, order_id, user.get_user_id())
    return payment


@payments_router.post("/create", response_model=Payment)
async def create_payment_post(
    session: DBSession,
    request: Request,
    order_id: int = Query(
        description="The unique identifier of the order to create a payment for", default=1),
    user: User = Depends(require_authentication)
) -> Payment:
    """Endpoint to create a payment for an order."""
    public_origin = get_request_origin(request)

    if public_origin:
        continue_url = f"{public_origin}/api/payments/return?order_id={order_id}"
    else:
        continue_url = str(request.url_for(
            "payment_return_page").include_query_params(order_id=order_id))

    payment = await create_payment_for_order(session, order_id, user, continue_url)
    return payment


@payments_router.get("/return", include_in_schema=False, response_class=HTMLResponse)
async def payment_return_page(request: Request, order_id: int = Query(default=0)) -> HTMLResponse:
    app_url = f"myapp://orders/{order_id}?paymentReturn=1" if order_id > 0 else "myapp://orders?paymentReturn=1"
    web_url = f"{str(request.base_url).rstrip('/')}/orders/{order_id}?paymentReturn=1" if order_id > 0 else f"{str(request.base_url).rstrip('/')}/orders?paymentReturn=1"
    html = f"""
<!doctype html>
<html lang="pl">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Powrót do aplikacji</title>
        <style>
            body {{
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(180deg, #f5f7fb 0%, #e9eef6 100%);
                color: #132238;
                font-family: Arial, sans-serif;
            }}
            main {{
                width: min(420px, calc(100vw - 32px));
                padding: 32px 28px;
                border-radius: 24px;
                background: #ffffff;
                box-shadow: 0 18px 48px rgba(19, 34, 56, 0.12);
                text-align: center;
            }}
            h1 {{
                margin: 0 0 12px;
                font-size: 24px;
            }}
            p {{
                margin: 0;
                color: #546173;
                line-height: 1.5;
            }}
            a {{
                display: inline-flex;
                margin-top: 20px;
                padding: 12px 18px;
                border-radius: 999px;
                background: #0d6efd;
                color: #ffffff;
                text-decoration: none;
                font-weight: 700;
            }}
        </style>
    </head>
    <body>
        <main>
            <h1>Wracamy do aplikacji</h1>
            <p>Możesz zamknąć to okno, jeśli nie zniknie automatycznie.</p>
            <a href="{web_url}">Wróć do zamówienia</a>
        </main>
        <script>
            const appUrl = {app_url!r};
            const webUrl = {web_url!r};
            const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);

            try {{
                if (window.opener && !window.opener.closed) {{
                    window.opener.postMessage({{ type: 'payment-return', orderId: {order_id} }}, '*');
                }}
            }} catch (error) {{}}

            if (isMobile) {{
                window.setTimeout(() => {{
                    window.location.replace(appUrl);
                }}, 250);
            }} else {{
                window.setTimeout(() => {{
                    window.location.replace(webUrl);
                }}, 250);
            }}

            window.setTimeout(() => {{
                window.close();
            }}, 1200);
        </script>
    </body>
</html>
"""
    return HTMLResponse(content=html)
