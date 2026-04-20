from src.notifications.models import NotificationResponse
from datetime import datetime, timedelta
from src.products.utils import get_top_10_products_with_lowest_stock_from_db, get_top_10_new_products_from_db, get_top_10_products_with_highest_price_from_db, get_top_10_products_with_lowest_price_from_db
from src.sql.db import DBSession
from typing import Optional
import random
import asyncio


class NotificationGenerator:
    """Class responsible for generating store notifications."""

    def __init__(self, session: DBSession):
        self._generators: list[callable] = [
            self.generate_random_notification_for_low_stock,
            self.generate_random_notification_for_new_products,
            self.generate_random_notification_for_highest_price,
            self.generate_random_notification_for_lowest_price
        ]
        self.session = session

    async def generate_random_notification_for_new_products(self) -> Optional[NotificationResponse]:
        """Generates a notification for new products."""
        new_products = await get_top_10_new_products_from_db(self.session)
        if not new_products:
            return None

        product = random.choice(new_products)

        message = f"Nowość w sklepie - {product.name}! Sprawdź już teraz."
        url = f"/products/{product.id}"

        return NotificationResponse(
            message=message,
            url=url,
            expires_at=datetime.now() + timedelta(minutes=10)
        )

    async def generate_random_notification_for_low_stock(self) -> Optional[NotificationResponse]:
        """Generates a notification for products with low stock."""
        low_stock_products = await get_top_10_products_with_lowest_stock_from_db(self.session)
        if not low_stock_products:
            return None

        product = random.choice(low_stock_products)

        message = f"Ostatnia szansa by kupić ten produkt - {product.name}! Zostało tylko {product.amount} sztuk."
        url = f"/products/{product.id}"

        return NotificationResponse(
            message=message,
            url=url,
            expires_at=datetime.now() + timedelta(minutes=10)
        )

    async def generate_random_notification_for_highest_price(self) -> Optional[NotificationResponse]:
        """Generates a notification for products with the highest price."""
        high_price_products = await get_top_10_products_with_highest_price_from_db(self.session)
        if not high_price_products:
            return None

        product = random.choice(high_price_products)

        message = f"Sprawdź nasz ekskluzywny produkt - {product.name}!"
        url = f"/products/{product.id}"

        return NotificationResponse(
            message=message,
            url=url,
            expires_at=datetime.now() + timedelta(minutes=10)
        )

    async def generate_random_notification_for_lowest_price(self) -> Optional[NotificationResponse]:
        """Generates a notification for products with the lowest price."""
        low_price_products = await get_top_10_products_with_lowest_price_from_db(self.session)
        if not low_price_products:
            return None

        product = random.choice(low_price_products)

        message = f"Nie przegap okazji - {product.name} w super cenie {product.price} PLN!"
        url = f"/products/{product.id}"

        return NotificationResponse(
            message=message,
            url=url,
            expires_at=datetime.now() + timedelta(minutes=10)
        )

    async def generate_random_notification(self) -> NotificationResponse:
        default_notification = NotificationResponse(
            message="Zapraszamy do zapoznania się z naszą ofertą! Mamy wiele ciekawych produktów w atrakcyjnych cenach.",
            url="/",
            expires_at=datetime.now() + timedelta(minutes=10)
        )

        generators = self._generators[:]
        random.shuffle(generators)

        try:
            for generator in generators:
                notification = await generator()
                if notification is not None:
                    return notification
        except Exception:
            return default_notification

        return default_notification
