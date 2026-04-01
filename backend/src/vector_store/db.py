from chromadb import HttpClient
from chromadb.config import Settings
from chromadb.api import ClientAPI
from functools import lru_cache
from src.config import config


@lru_cache(maxsize=1)
def get_chroma_client() -> ClientAPI:
    """Singleton client for Chroma DB service."""
    return HttpClient(
        host=config.vector_store_settings.chroma_host,
        port=config.vector_store_settings.chroma_port,
        settings=Settings(
            anonymized_telemetry=config.vector_store_settings.chroma_anonymized_telemetry,
        ),
    )
