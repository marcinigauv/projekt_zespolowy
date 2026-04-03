from enum import StrEnum


class PaymentStatus(StrEnum):
    NEW = "NEW"
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    EXPIRED = "EXPIRED"
    REJECTED = "REJECTED"
    ERROR = "ERROR"
    ABANDONED = "ABANDONED"
