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


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_nested_delimiter='__', case_sensitive=False, env_file='.env', extra='allow')

    db_sql_settings: DbSQLSettings
    auth_settings: AuthSettings


config = Config()  # type: ignore
