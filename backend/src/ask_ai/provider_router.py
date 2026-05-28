from __future__ import annotations

from src.config import config
from src.ask_ai.models import AskAiProviderAttempt
from src.ask_ai.provider_types import (
    AskAiConfigurationError,
    AskAiProvider,
    AskAiProviderError,
    AskAiResponseError,
    AskAiTransientProviderError,
    ProviderGenerationRequest,
)
from src.ask_ai.providers.bedrock import BedrockAskAiProvider
from src.ask_ai.providers.groq import GroqAskAiProvider
from dataclasses import dataclass


class AskAiGenerationFailed(AskAiProviderError):
    def __init__(self, message: str, attempts: list[AskAiProviderAttempt], failover_reason: str | None = None):
        super().__init__(message)
        self.attempts = attempts
        self.failover_reason = failover_reason
        self.last_error_class = attempts[-1].error_class if attempts else None


@dataclass(frozen=True)
class ProviderGenerationResult:
    content: str
    selected_provider: str
    attempts: list[AskAiProviderAttempt]
    failover_reason: str | None = None


def _build_provider(provider_name: str) -> AskAiProvider:
    normalized_provider_name = provider_name.strip().lower()
    if normalized_provider_name == "groq":
        return GroqAskAiProvider()
    if normalized_provider_name == "bedrock":
        return BedrockAskAiProvider()
    raise AskAiConfigurationError(
        f"Unsupported AskAI provider: {provider_name}")


class AskAiProviderRouter:
    async def generate(self, request: ProviderGenerationRequest) -> ProviderGenerationResult:
        attempts: list[AskAiProviderAttempt] = []
        primary_provider_name = config.ask_ai_settings.primary_provider
        fallback_provider_name = config.ask_ai_settings.fallback_provider

        provider_order = [primary_provider_name]
        if fallback_provider_name and fallback_provider_name != primary_provider_name:
            provider_order.append(fallback_provider_name)

        failover_reason: str | None = None

        for attempt_number, provider_name in enumerate(provider_order, start=1):
            provider = _build_provider(provider_name)
            try:
                content = await provider.generate(request)
            except AskAiTransientProviderError as exc:
                attempts.append(
                    AskAiProviderAttempt(
                        attempt_number=attempt_number,
                        provider_name=provider.name,
                        outcome="transient_error",
                        error_class=exc.__class__.__name__,
                        error_message=str(exc),
                    )
                )

                is_primary_attempt = attempt_number == 1
                should_failover = (
                    is_primary_attempt
                    and config.ask_ai_settings.failover_enabled
                    and fallback_provider_name is not None
                )
                if should_failover:
                    failover_reason = exc.__class__.__name__
                    continue

                raise AskAiGenerationFailed(
                    message="AskAI provider request failed.",
                    attempts=attempts,
                    failover_reason=failover_reason,
                ) from exc
            except AskAiProviderError as exc:
                attempts.append(
                    AskAiProviderAttempt(
                        attempt_number=attempt_number,
                        provider_name=provider.name,
                        outcome="terminal_error",
                        error_class=exc.__class__.__name__,
                        error_message=str(exc),
                    )
                )
                raise AskAiGenerationFailed(
                    message="AskAI provider request failed.",
                    attempts=attempts,
                    failover_reason=failover_reason,
                ) from exc

            attempts.append(
                AskAiProviderAttempt(
                    attempt_number=attempt_number,
                    provider_name=provider.name,
                    outcome="success",
                )
            )
            return ProviderGenerationResult(
                content=content,
                selected_provider=provider.name,
                attempts=attempts,
                failover_reason=failover_reason,
            )

        raise AskAiGenerationFailed(
            message="AskAI provider request failed.",
            attempts=attempts,
            failover_reason=failover_reason,
        )


def get_provider_router() -> AskAiProviderRouter:
    return AskAiProviderRouter()
