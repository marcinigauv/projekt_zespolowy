from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
from datetime import datetime


class BaseResponseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True,
                              alias_generator=to_camel, populate_by_name=True)


class NotificationResponse(BaseResponseModel):
    message: str = Field(description="The notification message")
    url: str = Field(description="The URL associated with the notification")
    expires_at: datetime = Field(
        description="The expiration time of the notification")
