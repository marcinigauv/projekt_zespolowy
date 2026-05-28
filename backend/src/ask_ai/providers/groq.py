from __future__ import annotations

import httpx

from src.ask_ai.provider_types import (
    AskAiConfigurationError,
    AskAiResponseError,
    AskAiTransientProviderError,
    ProviderGenerationRequest,
)
from src.config import config


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
        try:
            async with httpx.AsyncClient(base_url=config.groq_settings.base_url, timeout=timeout) as client:
                response = await client.post("/chat/completions", headers=headers, json=payload)
        except httpx.TimeoutException as exc:
            raise AskAiTransientProviderError(
                "Groq request timed out.") from exc
        except httpx.HTTPError as exc:
            raise AskAiTransientProviderError("Groq transport error.") from exc

        if response.status_code in {408, 409, 429} or response.status_code >= 500:
            raise AskAiTransientProviderError(
                f"Groq returned {response.status_code}.")
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
            raise AskAiResponseError("Groq returned an empty completion.")

        return content
