from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel, Field


class DbSQLSettings(BaseModel):
    host: str
    port: int
    username: str
    password: str
    database: str


class AuthSettings(BaseModel):
    password_pepper: str


class VectorStoreSettings(BaseModel):
    chroma_host: str
    chroma_port: int
    chroma_anonymized_telemetry: bool


class PaymentsSettings(BaseModel):
    provider_url: str
    api_key: str
    sign_phrase: str


class RedisSettings(BaseModel):
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: str | None = None


class AskAiSettings(BaseModel):
    enabled: bool = False
    primary_provider: str = "groq"
    fallback_provider: str | None = None
    failover_enabled: bool = False
    session_ttl_seconds: int = 900
    message_ttl_seconds: int = 900
    request_timeout_seconds: int = 20
    max_context_products: int = 5
    prompt_manifest_path: str = "prompts/ask_ai/manifest.json"


class GroqSettings(BaseModel):
    api_key: str = Field(min_length=1)
    base_url: str = "https://api.groq.com/openai/v1"
    model: str = "llama-3.3-70b-versatile"


class BedrockSettings(BaseModel):
    region: str = "eu-central-1"
    model_id: str = "eu.amazon.nova-lite-v1:0"
    guardrail_id: str | None = None
    guardrail_version: str | None = None


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_nested_delimiter='__', case_sensitive=False, env_file='.env', extra='allow')

    db_sql_settings: DbSQLSettings
    auth_settings: AuthSettings
    vector_store_settings: VectorStoreSettings
    payments_settings: PaymentsSettings
    redis_settings: RedisSettings = RedisSettings()
    ask_ai_settings: AskAiSettings = AskAiSettings()
    groq_settings: GroqSettings
    bedrock_settings: BedrockSettings = BedrockSettings()


config = Config()  # type: ignore
