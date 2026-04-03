from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel


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


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_nested_delimiter='__', case_sensitive=False, env_file='.env', extra='allow')

    db_sql_settings: DbSQLSettings
    auth_settings: AuthSettings
    vector_store_settings: VectorStoreSettings
    payments_settings: PaymentsSettings


config = Config()  # type: ignore
