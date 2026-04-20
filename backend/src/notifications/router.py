from fastapi import APIRouter, Request
from src.notifications.models import NotificationResponse
from src.notifications.use_cases import fetch_notifications
from src.sql.db import DBSession


notifications_router = APIRouter(
    prefix="/notifications", tags=["notifications"])


@notifications_router.get("/", response_model=NotificationResponse, status_code=200)
async def get_notifications(request: Request, session: DBSession) -> NotificationResponse:
    """Endpoint to retrieve general notifications."""
    notification = await fetch_notifications(session)
    return notification
