from sqlmodel import SQLModel, Field as field
from pydantic import BaseModel, Field, EmailStr, SecretStr, ConfigDict
from pydantic.alias_generators import to_camel


class BaseResponseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True,
                              alias_generator=to_camel, populate_by_name=True)


class UserLogin(BaseModel):
    email: EmailStr = Field(description="The email of the user", min_length=1)
    password: str = Field(
        description="The password of the user", min_length=1)


class UserCreate(BaseModel):
    name: str = Field(description="The name of the user", min_length=1)
    surname: str = Field(description="The surname of the user", min_length=1)
    email: EmailStr = Field(description="The email of the user", min_length=1)
    password: SecretStr = Field(
        description="The password of the user", min_length=1)


class UserResponse(BaseResponseModel):
    id: int = Field(description="The unique identifier of the user")
    name: str = Field(description="The name of the user")
    surname: str = Field(description="The surname of the user")
    email: EmailStr = Field(description="The email of the user")


class User(SQLModel, table=True):
    id: int | None = field(primary_key=True,
                           unique=True, index=True, default=None)
    name: str = field(description="The name of the user", min_length=1)
    surname: str = field(description="The surname of the user", min_length=1)
    email: str = field(
        description="The email of the user", min_length=1, unique=True, index=True)
    password: str = field(
        description="The hash of password of the user", min_length=1, exclude=True)
