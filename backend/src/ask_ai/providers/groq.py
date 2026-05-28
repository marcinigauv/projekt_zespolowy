from __future__ import annotations

import asyncio
import re

import httpx

from src.ask_ai.provider_types import (
    AskAiConfigurationError,
    AskAiResponseError,
    AskAiTransientProviderError,
    ProviderGenerationRequest,
)
from src.config import config


MAX_TRANSIENT_RETRIES = 1
DEFAULT_TRANSIENT_RETRY_SECONDS = 8.0
MAX_TRANSIENT_RETRY_SECONDS = 45.0
RETRY_AFTER_SECONDS_PATTERN = re.compile(r"^\s*(\d+(?:\.\d+)?)\s*$")


def _extract_rate_limit_headers(response: httpx.Response) -> str:
    relevant_header_names = (
        "retry-after",
        "x-ratelimit-reset",
        "x-ratelimit-reset-requests",
        "x-ratelimit-reset-tokens",
        "x-ratelimit-remaining-requests",
        "x-ratelimit-remaining-tokens",
    )
    present_headers: list[str] = []

    for header_name in relevant_header_names:
        header_value = response.headers.get(header_name)
        if header_value:
            present_headers.append(f"{header_name}={header_value}")

    return ", ".join(present_headers)


def _resolve_retry_after_seconds(response: httpx.Response) -> float | None:
    retry_after_header = response.headers.get("retry-after")
    if not retry_after_header:
        return None

    match = RETRY_AFTER_SECONDS_PATTERN.match(retry_after_header)
    if match is None:
        return None

    retry_after_seconds = float(match.group(1))
    retry_after_seconds = max(retry_after_seconds, 0.0)
    return min(retry_after_seconds, MAX_TRANSIENT_RETRY_SECONDS)


class GroqAskAiProvider:
    name = "groq"

    async def generate(self, request: ProviderGenerationRequest) -> str:
        api_key = config.groq_settings.api_key
        if not api_key:
            raise AskAiConfigurationError("Missing Groq API key.")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": config.groq_settings.model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": request.system_prompt},
                {"role": "user", "content": request.user_prompt},
            ],
        }

        timeout = httpx.Timeout(config.ask_ai_settings.request_timeout_seconds)
        transient_attempt = 0

        async with httpx.AsyncClient(base_url=config.groq_settings.base_url, timeout=timeout) as client:
            while True:
                try:
                    response = await client.post("/chat/completions", headers=headers, json=payload)
                except httpx.TimeoutException as exc:
                    if transient_attempt >= MAX_TRANSIENT_RETRIES:
                        raise AskAiTransientProviderError(
                            "Groq request timed out.") from exc
                    transient_attempt += 1
                    await asyncio.sleep(DEFAULT_TRANSIENT_RETRY_SECONDS)
                    continue
                except httpx.HTTPError as exc:
                    if transient_attempt >= MAX_TRANSIENT_RETRIES:
                        raise AskAiTransientProviderError(
                            "Groq transport error.") from exc
                    transient_attempt += 1
                    await asyncio.sleep(DEFAULT_TRANSIENT_RETRY_SECONDS)
                    continue

                if response.status_code in {408, 409, 429} or response.status_code >= 500:
                    rate_limit_headers = _extract_rate_limit_headers(response)
                    details = f" headers: {rate_limit_headers}" if rate_limit_headers else ""

                    if transient_attempt >= MAX_TRANSIENT_RETRIES:
                        raise AskAiTransientProviderError(
                            f"Groq returned {response.status_code}.{details}")

                    transient_attempt += 1
                    retry_after_seconds = _resolve_retry_after_seconds(
                        response)
                    wait_seconds = (
                        retry_after_seconds
                        if retry_after_seconds is not None
                        else DEFAULT_TRANSIENT_RETRY_SECONDS
                    )
                    await asyncio.sleep(wait_seconds)
                    continue

                if response.status_code in {401, 403}:
                    raise AskAiConfigurationError(
                        f"Groq authorization failed with status {response.status_code}.")
                if response.status_code >= 400:
                    raise AskAiResponseError(
                        f"Groq returned unexpected status {response.status_code}.")

                data = response.json()
                try:
                    content = data["choices"][0]["message"]["content"].strip()
                except (KeyError, IndexError, TypeError) as exc:
                    raise AskAiResponseError(
                        "Groq response has unexpected shape.") from exc

                if not content:
                    raise AskAiResponseError(
                        "Groq returned an empty completion.")

                return content
