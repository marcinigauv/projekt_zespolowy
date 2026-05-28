from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class AskAiBaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class AskAiMessageStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    ERROR = "error"
    SESSION_RESET = "session_reset"


class AskAiProviderAttempt(AskAiBaseModel):
    attempt_number: int
    provider_name: str
    outcome: str
    error_class: str | None = None
    error_message: str | None = None


class AskAiSuggestedProduct(AskAiBaseModel):
    id: int
    name: str
    description: str
    price: float
    amount: int
    categories: list[str] = Field(default_factory=list)
    image_url: str | None = None
    product_path: str


class AskAiSessionState(AskAiBaseModel):
    session_id: str
    user_id: int
    created_at: datetime
    expires_at: datetime
    latest_message_id: str | None = None
    message_ids: list[str] = Field(default_factory=list)
    initial_theme_snapshot: str | None = None
    latest_theme_snapshot: str | None = None
    theme_history: list[str] = Field(default_factory=list)
    theme_change_count: int = 0


class AskAiMessageState(AskAiBaseModel):
    session_id: str
    message_id: str
    user_id: int
    user_name: str
    user_message: str
    status: AskAiMessageStatus
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    active_theme_snapshot: str
    tone_profile: str
    use_case: str
    theme_changed_during_session: bool = False
    theme_change_count: int = 0
    theme_history_summary: str = ""
    partial_response: str = ""
    final_response: str | None = None
    selected_provider: str | None = None
    failover_reason: str | None = None
    error_code: str | None = None
    last_error_class: str | None = None
    prompt_version: str | None = None
    provider_attempts: list[AskAiProviderAttempt] = Field(default_factory=list)
    suggested_products: list[AskAiSuggestedProduct] = Field(
        default_factory=list)


class AskAiSessionResponse(AskAiBaseModel):
    session_id: str
    expires_at: datetime
    primary_provider: str
    fallback_provider: str | None = None


class AskAiMessageRequest(AskAiBaseModel):
    session_id: str = Field(min_length=1)
    message: str = Field(min_length=1, max_length=4000)


class AskAiMessageAcceptedResponse(AskAiBaseModel):
    session_id: str
    message_id: str
    status: AskAiMessageStatus
    active_theme_snapshot: str
    tone_profile: str


class AskAiTranscriptEntry(AskAiBaseModel):
    message_id: str
    user_message: str
    assistant_response: str = ""
    status: AskAiMessageStatus
    created_at: datetime
    updated_at: datetime
    suggested_products: list[AskAiSuggestedProduct] = Field(
        default_factory=list)


class AskAiMessagePollResponse(AskAiBaseModel):
    session_id: str
    message_id: str | None = None
    status: AskAiMessageStatus
    partial_response: str = ""
    final_response: str | None = None
    active_theme_snapshot: str | None = None
    tone_profile: str | None = None
    selected_provider: str | None = None
    failover_reason: str | None = None
    error_code: str | None = None
    last_error_class: str | None = None
    suggested_products: list[AskAiSuggestedProduct] = Field(
        default_factory=list)
    transcript: list[AskAiTranscriptEntry] = Field(default_factory=list)
