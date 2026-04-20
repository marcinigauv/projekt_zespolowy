from src.notifications.models import NotificationResponse
from src.notifications.generator import NotificationGenerator
from datetime import datetime, timedelta
from src.sql.db import DBSession


async def fetch_notifications(session: DBSession) -> NotificationResponse:
    """Use case to retrieve general notifications."""
    notification_generator = NotificationGenerator(session)
    notification = await notification_generator.generate_random_notification()
    return notification
