from __future__ import annotations

import asyncio

import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import BotoCoreError, ClientError, NoCredentialsError

from src.ask_ai.provider_types import (
    AskAiConfigurationError,
    AskAiResponseError,
    AskAiTransientProviderError,
    ProviderGenerationRequest,
)
from src.config import config


class BedrockAskAiProvider:
    name = "bedrock"

    async def generate(self, request: ProviderGenerationRequest) -> str:
        model_id = config.bedrock_settings.model_id.strip()
        region = config.bedrock_settings.region.strip()

        if not model_id:
            raise AskAiConfigurationError("Missing Bedrock model id.")
        if not region:
            raise AskAiConfigurationError("Missing Bedrock region.")

        timeout_seconds = config.ask_ai_settings.request_timeout_seconds
        client_config = BotoConfig(
            connect_timeout=timeout_seconds,
            read_timeout=timeout_seconds,
            retries={"max_attempts": 1, "mode": "standard"},
        )

        try:
            client = boto3.client(
                "bedrock-runtime",
                region_name=region,
                config=client_config,
            )
        except Exception as exc:
            raise AskAiConfigurationError(
                "Failed to initialize Bedrock runtime client."
            ) from exc

        payload: dict[str, object] = {
            "modelId": model_id,
            "system": [{"text": request.system_prompt}],
            "messages": [
                {
                    "role": "user",
                    "content": [{"text": request.user_prompt}],
                }
            ],
        }

        if config.bedrock_settings.guardrail_id and config.bedrock_settings.guardrail_version:
            payload["guardrailConfig"] = {
                "guardrailIdentifier": config.bedrock_settings.guardrail_id,
                "guardrailVersion": config.bedrock_settings.guardrail_version,
            }

        try:
            response = await asyncio.to_thread(client.converse, **payload)
        except NoCredentialsError as exc:
            raise AskAiConfigurationError(
                "Missing AWS credentials for Bedrock.") from exc
        except ClientError as exc:
            error_code = exc.response.get(
                "Error", {}).get("Code", "ClientError")
            status_code = exc.response.get(
                "ResponseMetadata", {}).get("HTTPStatusCode")
            if error_code in {
                "ThrottlingException",
                "TooManyRequestsException",
                "ServiceUnavailableException",
                "InternalServerException",
                "ModelTimeoutException",
                "ModelNotReadyException",
            } or status_code in {408, 409, 429, 500, 502, 503, 504}:
                raise AskAiTransientProviderError(
                    f"Bedrock request failed with transient error {error_code}."
                ) from exc
            if error_code in {
                "AccessDeniedException",
                "UnrecognizedClientException",
                "ValidationException",
                "ResourceNotFoundException",
            }:
                raise AskAiConfigurationError(
                    f"Bedrock request failed with configuration error {error_code}."
                ) from exc
            raise AskAiResponseError(
                f"Bedrock returned unexpected error {error_code}."
            ) from exc
        except BotoCoreError as exc:
            raise AskAiTransientProviderError(
                "Bedrock transport error.") from exc

        try:
            content_blocks = response["output"]["message"]["content"]
        except (KeyError, TypeError) as exc:
            raise AskAiResponseError(
                "Bedrock response has unexpected shape.") from exc

        text_parts = [
            block["text"].strip()
            for block in content_blocks
            if isinstance(block, dict) and isinstance(block.get("text"), str)
        ]
        content = "\n".join(part for part in text_parts if part).strip()

        if not content:
            raise AskAiResponseError("Bedrock returned an empty completion.")

        return content
