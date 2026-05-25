from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class DbSQLSettings(BaseModel):
    host: str
    port: int
    username: str
    password: str
    database: str


class VectorStoreSettings(BaseModel):
    chroma_host: str
    chroma_port: int
    chroma_anonymized_telemetry: bool


class EmbeddingWorkerConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_nested_delimiter="__",
        case_sensitive=False,
        env_file=".env",
        extra="allow",
    )

    db_sql_settings: DbSQLSettings
    vector_store_settings: VectorStoreSettings


config = EmbeddingWorkerConfig()  # type: ignore