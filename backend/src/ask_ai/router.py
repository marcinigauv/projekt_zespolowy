from fastapi import APIRouter, BackgroundTasks, Depends, Query

from src.ask_ai.models import (
    AskAiMessageAcceptedResponse,
    AskAiMessagePollResponse,
    AskAiMessageRequest,
    AskAiSessionResponse,
)
from src.ask_ai.use_cases import (
    create_message_for_user,
    get_latest_message_for_user,
    process_message_generation,
    reset_session_for_user,
)
from src.sql.models import User
from src.users.dependecies import require_authentication


ask_ai_router = APIRouter(prefix="/ask-ai", tags=["ask-ai"])


@ask_ai_router.post("/session/reset", response_model=AskAiSessionResponse)
async def reset_ask_ai_session(user: User = Depends(require_authentication)) -> AskAiSessionResponse:
    return await reset_session_for_user(user)


@ask_ai_router.post("/messages", response_model=AskAiMessageAcceptedResponse)
async def create_ask_ai_message(
    message_request: AskAiMessageRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(require_authentication),
) -> AskAiMessageAcceptedResponse:
    accepted_response = await create_message_for_user(message_request, user)
    background_tasks.add_task(
        process_message_generation,
        user.get_user_id(),
        accepted_response.session_id,
        accepted_response.message_id,
    )
    return accepted_response


@ask_ai_router.get("/messages/latest", response_model=AskAiMessagePollResponse)
async def get_latest_ask_ai_message(
    session_id: str = Query(min_length=1),
    user: User = Depends(require_authentication),
) -> AskAiMessagePollResponse:
    return await get_latest_message_for_user(user, session_id)
