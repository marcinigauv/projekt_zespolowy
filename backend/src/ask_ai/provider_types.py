from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


class AskAiProviderError(RuntimeError):
    """Base provider error."""


class AskAiTransientProviderError(AskAiProviderError):
    """Provider error eligible for failover."""


class AskAiConfigurationError(AskAiProviderError):
    """Provider configuration is invalid."""


class AskAiResponseError(AskAiProviderError):
    """Provider returned an unusable response."""


@dataclass(frozen=True)
class ProviderGenerationRequest:
    system_prompt: str
    user_prompt: str


class AskAiProvider(Protocol):
    name: str

    async def generate(self, request: ProviderGenerationRequest) -> str:
        ...
