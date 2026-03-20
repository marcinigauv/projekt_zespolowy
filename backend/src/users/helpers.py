from passlib.context import CryptContext
from src.config import config


pwd_context = CryptContext(
    schemes=["bcrypt"],
    bcrypt__rounds=13,
    bcrypt__ident="2b",
)


def hash_password(password: str) -> str:
    """Hashes a password with a secret pepper."""
    peppered_input = password + config.auth_settings.password_pepper
    return pwd_context.hash(peppered_input)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Securely compares a password with a hash."""
    peppered_input = plain_password + config.auth_settings.password_pepper
    return pwd_context.verify(peppered_input, hashed_password)
