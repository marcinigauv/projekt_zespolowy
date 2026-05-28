from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
import re
import unicodedata
from fastapi import HTTPException, status
from uuid import uuid4

from src.ask_ai.models import (
    AskAiMessageAcceptedResponse,
    AskAiMessagePollResponse,
    AskAiMessageRequest,
    AskAiMessageState,
    AskAiMessageStatus,
    AskAiSuggestedProduct,
    AskAiSessionResponse,
    AskAiTranscriptEntry,
)
from src.ask_ai.prompt_engine import load_prompt_bundle
from src.ask_ai.provider_router import AskAiGenerationFailed, ProviderGenerationRequest, get_provider_router
from src.ask_ai.retrieval import build_catalog_context
from src.ask_ai.session_store import session_store
from src.ask_ai.tone_profiles import resolve_tone_profile
from src.config import config
from src.sql.models import Product
from src.sql.db import db
from src.sql.models import User
from src.users.utils import get_user_details_from_db_by_id


SESSION_TRANSCRIPT_LIMIT = 20
PROMPT_HISTORY_LIMIT = 8
SUGGESTED_PRODUCTS_LIMIT = 4
NO_MATCH_RESPONSE_MARKERS = (
    "nie mamy",
    "nie posiadamy",
    "nie ma",
    "brak",
    "nie znalezion",
)
PRODUCT_LINE_PATTERN = re.compile(r"^\s*(?:[-*]|\d+\.)\s+")
PRICE_MARKER_PATTERN = re.compile(r"\d+(?:[.,]\d+)?\s*zł", re.IGNORECASE)
PRODUCT_TOKEN_PATTERN = re.compile(r"[0-9a-ząćęłńóśźż]+", re.IGNORECASE)


logger = logging.getLogger(__name__)


def _build_theme_history_summary(theme_history: list[str]) -> str:
    if not theme_history:
        return ""
    return " -> ".join(theme_history)


def _build_suggested_products(products: list[Product]) -> list[AskAiSuggestedProduct]:
    suggestions: list[AskAiSuggestedProduct] = []
    for product in products[:SUGGESTED_PRODUCTS_LIMIT]:
        suggestions.append(
            AskAiSuggestedProduct(
                id=product.get_id(),
                name=product.name,
                description=" ".join(product.description.split()),
                price=float(product.price),
                amount=product.amount,
                categories=list(product.categories),
                image_url=product.image_url,
                product_path=f"/products/{product.get_id()}",
            )
        )
    return suggestions


def _build_transcript_entry(message_state: AskAiMessageState) -> AskAiTranscriptEntry:
    return AskAiTranscriptEntry(
        message_id=message_state.message_id,
        user_message=message_state.user_message,
        assistant_response=message_state.final_response
        or message_state.partial_response,
        status=message_state.status,
        created_at=message_state.created_at,
        updated_at=message_state.updated_at,
        suggested_products=message_state.suggested_products,
    )


def _response_indicates_no_catalog_match(response: str) -> bool:
    normalized = response.strip().lower()
    if not normalized:
        return False
    return any(marker in normalized for marker in NO_MATCH_RESPONSE_MARKERS)


def _normalize_product_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value.lower())
    without_diacritics = "".join(
        char for char in normalized if not unicodedata.combining(char)
    )
    ascii_only = re.sub(r"[^0-9a-z\s]", " ", without_diacritics)
    return " ".join(ascii_only.split())


def _tokenize_product_text(value: str) -> set[str]:
    return {
        token
        for token in PRODUCT_TOKEN_PATTERN.findall(_normalize_product_text(value))
        if len(token) >= 3
    }


def _line_looks_like_product_reference(line: str) -> bool:
    normalized_line = line.strip()
    if not normalized_line:
        return False

    normalized_lower = normalized_line.lower()
    return (
        PRODUCT_LINE_PATTERN.match(normalized_line) is not None
        or PRICE_MARKER_PATTERN.search(normalized_lower) is not None
        or " zł" in normalized_lower
    )


def _line_matches_catalog_product(line: str, products: list[Product]) -> bool:
    normalized_line = _normalize_product_text(line)
    if not normalized_line:
        return True

    line_tokens = _tokenize_product_text(normalized_line)

    for product in products:
        normalized_product_name = _normalize_product_text(product.name)
        if normalized_product_name and normalized_product_name in normalized_line:
            return True

        product_tokens = _tokenize_product_text(product.name)
        if not product_tokens:
            continue

        overlap = len(line_tokens & product_tokens)
        required_overlap = 2 if len(product_tokens) >= 2 else 1
        if overlap >= required_overlap:
            return True

    return False


def _response_mentions_out_of_catalog_products(response: str, products: list[Product]) -> bool:
    if not response.strip() or not products:
        return False

    response_lines = [line.strip()
                      for line in response.splitlines() if line.strip()]
    product_like_lines = [
        line for line in response_lines if _line_looks_like_product_reference(line)
    ]

    if not product_like_lines:
        return False

    return any(
        not _line_matches_catalog_product(line, products)
        for line in product_like_lines
    )


def _format_conversation_history(messages: list[AskAiMessageState], current_message_id: str) -> str:
    prior_messages = [
        message
        for message in messages
        if message.message_id != current_message_id
    ][-PROMPT_HISTORY_LIMIT:]

    if not prior_messages:
        return "brak wcześniejszych wiadomości w tej sesji"

    lines: list[str] = []
    for message in prior_messages:
        lines.append(f"Użytkownik: {message.user_message}")
        assistant_response = message.final_response or message.partial_response
        if assistant_response:
            lines.append(f"AskAI: {assistant_response}")

    return "\n".join(lines)


def ensure_ask_ai_enabled() -> None:
    if not config.ask_ai_settings.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AskAI jest obecnie wyłączone.",
        )


async def reset_session_for_user(user: User) -> AskAiSessionResponse:
    ensure_ask_ai_enabled()
    session_state = await session_store.reset_session(user.get_user_id())
    return AskAiSessionResponse(
        session_id=session_state.session_id,
        expires_at=session_state.expires_at,
        primary_provider=config.ask_ai_settings.primary_provider,
        fallback_provider=config.ask_ai_settings.fallback_provider,
    )


async def create_message_for_user(
    message_request: AskAiMessageRequest,
    user: User,
) -> AskAiMessageAcceptedResponse:
    ensure_ask_ai_enabled()
    session_state = await session_store.get_session(user.get_user_id())
    if session_state is None or session_state.session_id != message_request.session_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Sesja AskAI jest nieaktualna. Zresetuj sesję i spróbuj ponownie.",
        )

    theme_snapshot = user.user_preferences.get("theme", "stitchLuxeLight")
    tone_profile = resolve_tone_profile(theme_snapshot)

    if session_state.initial_theme_snapshot is None:
        session_state.initial_theme_snapshot = theme_snapshot

    if not session_state.theme_history:
        session_state.theme_history = [theme_snapshot]
    elif session_state.theme_history[-1] != theme_snapshot:
        session_state.theme_history.append(theme_snapshot)
        session_state.theme_change_count += 1

    session_state.latest_theme_snapshot = theme_snapshot

    now = datetime.now(timezone.utc)
    message_state = AskAiMessageState(
        session_id=message_request.session_id,
        message_id=str(uuid4()),
        user_id=user.get_user_id(),
        user_name=user.name,
        user_message=message_request.message.strip(),
        status=AskAiMessageStatus.PENDING,
        created_at=now,
        updated_at=now,
        expires_at=now +
        timedelta(seconds=config.ask_ai_settings.message_ttl_seconds),
        active_theme_snapshot=theme_snapshot,
        tone_profile=tone_profile.key,
        use_case="pomoc katalogowa AskAI",
        theme_changed_during_session=session_state.theme_change_count > 0,
        theme_change_count=session_state.theme_change_count,
        theme_history_summary=_build_theme_history_summary(
            session_state.theme_history),
    )
    session_state.latest_message_id = message_state.message_id
    session_state.message_ids.append(message_state.message_id)
    if len(session_state.message_ids) > SESSION_TRANSCRIPT_LIMIT:
        session_state.message_ids = session_state.message_ids[-SESSION_TRANSCRIPT_LIMIT:]
    session_state.expires_at = now + \
        timedelta(seconds=config.ask_ai_settings.session_ttl_seconds)

    await session_store.save_message(message_state)
    await session_store.save_session(session_state)

    return AskAiMessageAcceptedResponse(
        session_id=message_state.session_id,
        message_id=message_state.message_id,
        status=message_state.status,
        active_theme_snapshot=message_state.active_theme_snapshot,
        tone_profile=tone_profile.label,
    )


async def process_message_generation(user_id: int, session_id: str, message_id: str) -> None:
    message_state = await session_store.get_message(session_id, message_id)
    if message_state is None:
        return

    prompt_bundle = load_prompt_bundle()
    fallback_message = prompt_bundle.get_value(
        "FALLBACK_MESSAGE", "Przykro mi, nie rozumiem tego zadania.")
    temporary_error_message = prompt_bundle.get_value(
        "TEMPORARY_ERROR_MESSAGE",
        "Przepraszam, chwilowo nie mogę przygotować odpowiedzi. Spróbuj ponownie za moment.",
    )

    current_session = await session_store.get_session(user_id)
    if current_session is None or current_session.session_id != session_id:
        message_state.status = AskAiMessageStatus.SESSION_RESET
        message_state.error_code = AskAiMessageStatus.SESSION_RESET.value
        message_state.final_response = fallback_message
        message_state.partial_response = fallback_message
        message_state.updated_at = datetime.now(timezone.utc)
        await session_store.save_message(message_state)
        return

    message_state.status = AskAiMessageStatus.RUNNING
    message_state.updated_at = datetime.now(timezone.utc)
    await session_store.save_message(message_state)

    session_factory = db.session_factory
    if session_factory is None:
        raise RuntimeError("Database session factory is not initialized.")

    try:
        async with session_factory() as session:
            user = await get_user_details_from_db_by_id(user_id, session)
            if user is None:
                raise RuntimeError(f"User with id={user_id} not found.")

            session_messages = await session_store.get_session_messages(
                session_id,
                current_session.message_ids,
            )
            conversation_history = _format_conversation_history(
                session_messages,
                message_state.message_id,
            )
            recent_user_messages = [
                message.user_message
                for message in session_messages
                if message.message_id != message_state.message_id
            ][-PROMPT_HISTORY_LIMIT:]
            catalog_context = await build_catalog_context(
                session,
                message_state.user_message,
                recent_user_messages=recent_user_messages,
            )

        if not catalog_context.is_domain_context:
            message_state.status = AskAiMessageStatus.BLOCKED
            message_state.partial_response = fallback_message
            message_state.final_response = fallback_message
            message_state.suggested_products = []
            message_state.updated_at = datetime.now(timezone.utc)
            await session_store.save_message(message_state)
            return

        tone_profile = resolve_tone_profile(
            message_state.active_theme_snapshot)
        message_state.use_case = catalog_context.use_case
        prompt_render = prompt_bundle.render(
            {
                "ACTIVE_THEME_SNAPSHOT": message_state.active_theme_snapshot,
                "TONE_PROFILE": tone_profile.label,
                "THEME_PROMPT_HINT": tone_profile.prompt_hint,
                "USE_CASE": catalog_context.use_case,
                "THEME_CHANGED_DURING_SESSION": "tak" if message_state.theme_changed_during_session else "nie",
                "THEME_CHANGE_COUNT": message_state.theme_change_count,
                "THEME_HISTORY_SUMMARY": message_state.theme_history_summary or "brak zmian motywu w tej sesji",
                "USER_NAME": user.name,
                "USER_MESSAGE": message_state.user_message,
                "CONVERSATION_HISTORY": conversation_history,
                "CATALOG_CONTEXT": catalog_context.rendered_context,
            }
        )

        generation_result = await get_provider_router().generate(
            ProviderGenerationRequest(
                system_prompt=prompt_render.system_prompt,
                user_prompt=prompt_render.user_prompt,
            )
        )

        normalized_response = generation_result.content.strip()
        mentions_out_of_catalog_products = _response_mentions_out_of_catalog_products(
            normalized_response,
            catalog_context.products,
        )
        if mentions_out_of_catalog_products:
            logger.warning(
                "AskAI response rejected as out-of-catalog | user_id=%s session_id=%s message_id=%s provider=%s response=%s",
                message_state.user_id,
                message_state.session_id,
                message_state.message_id,
                generation_result.selected_provider,
                normalized_response,
            )
            normalized_response = fallback_message

        is_exact_fallback_response = normalized_response == fallback_message
        indicates_no_catalog_match = _response_indicates_no_catalog_match(
            normalized_response)

        message_state.status = (
            AskAiMessageStatus.BLOCKED
            if is_exact_fallback_response
            else AskAiMessageStatus.COMPLETED
        )
        message_state.partial_response = normalized_response
        message_state.final_response = normalized_response
        message_state.selected_provider = generation_result.selected_provider
        message_state.failover_reason = generation_result.failover_reason
        message_state.prompt_version = prompt_render.version
        message_state.provider_attempts = generation_result.attempts
        message_state.suggested_products = (
            []
            if is_exact_fallback_response or indicates_no_catalog_match
            else _build_suggested_products(catalog_context.products)
        )
        message_state.updated_at = datetime.now(timezone.utc)

        logger.info(
            "AskAI LLM response | user_id=%s session_id=%s message_id=%s provider=%s status=%s response=%s",
            message_state.user_id,
            message_state.session_id,
            message_state.message_id,
            message_state.selected_provider,
            message_state.status.value,
            normalized_response,
        )

        await session_store.save_message(message_state)
    except AskAiGenerationFailed as exc:
        message_state.status = AskAiMessageStatus.ERROR
        message_state.error_code = "provider_error"
        message_state.last_error_class = exc.last_error_class
        message_state.failover_reason = exc.failover_reason
        message_state.provider_attempts = exc.attempts
        message_state.partial_response = temporary_error_message
        message_state.final_response = temporary_error_message
        message_state.suggested_products = []
        message_state.updated_at = datetime.now(timezone.utc)

        last_error_message = (
            message_state.provider_attempts[-1].error_message
            if message_state.provider_attempts
            else None
        )

        logger.warning(
            "AskAI generation failed | user_id=%s session_id=%s message_id=%s last_error_class=%s failover_reason=%s attempts=%s last_error_message=%s",
            message_state.user_id,
            message_state.session_id,
            message_state.message_id,
            message_state.last_error_class,
            message_state.failover_reason,
            len(message_state.provider_attempts),
            last_error_message,
        )

        await session_store.save_message(message_state)
    except Exception as exc:
        message_state.status = AskAiMessageStatus.ERROR
        message_state.error_code = "internal_error"
        message_state.last_error_class = exc.__class__.__name__
        message_state.partial_response = temporary_error_message
        message_state.final_response = temporary_error_message
        message_state.suggested_products = []
        message_state.updated_at = datetime.now(timezone.utc)

        logger.exception(
            "AskAI internal error | user_id=%s session_id=%s message_id=%s",
            message_state.user_id,
            message_state.session_id,
            message_state.message_id,
        )

        await session_store.save_message(message_state)


async def get_latest_message_for_user(user: User, session_id: str) -> AskAiMessagePollResponse:
    ensure_ask_ai_enabled()
    current_session = await session_store.get_session(user.get_user_id())
    if current_session is None or current_session.session_id != session_id:
        return AskAiMessagePollResponse(
            session_id=session_id,
            status=AskAiMessageStatus.SESSION_RESET,
            error_code=AskAiMessageStatus.SESSION_RESET.value,
        )

    session_messages = await session_store.get_session_messages(
        session_id,
        current_session.message_ids,
    )
    if not session_messages:
        return AskAiMessagePollResponse(
            session_id=session_id,
            status=AskAiMessageStatus.PENDING,
        )

    transcript = [_build_transcript_entry(
        message) for message in session_messages]
    latest_message_id = current_session.latest_message_id
    message_state = next(
        (message for message in reversed(session_messages)
         if message.message_id == latest_message_id),
        session_messages[-1],
    )

    return AskAiMessagePollResponse(
        session_id=message_state.session_id,
        message_id=message_state.message_id,
        status=message_state.status,
        partial_response=message_state.partial_response,
        final_response=message_state.final_response,
        active_theme_snapshot=message_state.active_theme_snapshot,
        tone_profile=message_state.tone_profile,
        selected_provider=message_state.selected_provider,
        failover_reason=message_state.failover_reason,
        error_code=message_state.error_code,
        last_error_class=message_state.last_error_class,
        suggested_products=message_state.suggested_products,
        transcript=transcript,
    )
