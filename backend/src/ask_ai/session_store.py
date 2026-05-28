from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Self
from uuid import uuid4

from redis.asyncio import Redis

from src.ask_ai.models import AskAiMessageState, AskAiSessionState
from src.config import config


class AskAiSessionStore:
    _instance: Self | None = None

    def __init__(self) -> None:
        self._redis: Redis | None = None

    @classmethod
    def get(cls) -> Self:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _get_redis(self) -> Redis:
        if self._redis is None:
            self._redis = Redis(
                host=config.redis_settings.host,
                port=config.redis_settings.port,
                db=config.redis_settings.db,
                password=config.redis_settings.password,
                decode_responses=True,
            )
        return self._redis

    def _session_key(self, user_id: int) -> str:
        return f"askai:session:{user_id}"

    def _message_key(self, session_id: str, message_id: str) -> str:
        return f"askai:message:{session_id}:{message_id}"

    async def reset_session(self, user_id: int) -> AskAiSessionState:
        now = datetime.now(timezone.utc)
        expires_at = now + \
            timedelta(seconds=config.ask_ai_settings.session_ttl_seconds)
        session_state = AskAiSessionState(
            session_id=str(uuid4()),
            user_id=user_id,
            created_at=now,
            expires_at=expires_at,
        )
        await self.save_session(session_state)
        return session_state

    async def save_session(self, session_state: AskAiSessionState) -> None:
        await self._get_redis().set(
            self._session_key(session_state.user_id),
            session_state.model_dump_json(by_alias=True),
            ex=config.ask_ai_settings.session_ttl_seconds,
        )

    async def get_session(self, user_id: int) -> AskAiSessionState | None:
        payload = await self._get_redis().get(self._session_key(user_id))
        if payload is None:
            return None
        return AskAiSessionState.model_validate_json(payload)

    async def save_message(self, message_state: AskAiMessageState) -> None:
        await self._get_redis().set(
            self._message_key(message_state.session_id,
                              message_state.message_id),
            message_state.model_dump_json(by_alias=True),
            ex=config.ask_ai_settings.message_ttl_seconds,
        )

    async def get_message(self, session_id: str, message_id: str) -> AskAiMessageState | None:
        payload = await self._get_redis().get(self._message_key(session_id, message_id))
        if payload is None:
            return None
        return AskAiMessageState.model_validate_json(payload)

    async def get_session_messages(self, session_id: str, message_ids: list[str]) -> list[AskAiMessageState]:
        if not message_ids:
            return []

        payloads = await self._get_redis().mget(
            [self._message_key(session_id, message_id)
             for message_id in message_ids]
        )
        return [
            AskAiMessageState.model_validate_json(payload)
            for payload in payloads
            if payload is not None
        ]

    async def get_latest_message(self, user_id: int, session_id: str) -> AskAiMessageState | None:
        session_state = await self.get_session(user_id)
        if session_state is None or session_state.session_id != session_id:
            return None
        if session_state.latest_message_id is None:
            return None
        return await self.get_message(session_id, session_state.latest_message_id)


session_store = AskAiSessionStore.get()
