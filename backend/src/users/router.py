from src.sql.models import User
from fastapi import APIRouter, Request, Depends
from src.sql.db import DBSession
from src.users.models import UserCreate, UserLogin, UserResponse, UpdateUserPreferencesRequest, ChangePasswordRequest
from src.users.use_cases import create_new_user, verify_user_credentials, update_user_preferences, change_user_password
from src.users.exceptions import InvalidCredentialsException
from src.users.dependecies import set_session_user, require_authentication


users_router = APIRouter(prefix="/users", tags=["users"])


@users_router.post("/register", response_model=UserResponse)
async def post_register_user(user_create: UserCreate, session: DBSession, request: Request) -> UserResponse:
    """Endpoint to register a new user."""
    result = await create_new_user(user_create, session)
    set_session_user(request, result)
    return UserResponse.model_validate(result)


@users_router.post("/login", response_model=UserResponse)
async def post_login_user(user_login: UserLogin, session: DBSession, request: Request) -> UserResponse:
    """Endpoint to log in a user."""
    user = await verify_user_credentials(user_login.email, user_login.password, session)
    if not user:
        raise InvalidCredentialsException
    set_session_user(request, user)
    return UserResponse.model_validate(user)


@users_router.get("/me", response_model=UserResponse)
async def get_me_user(request: Request, user: User = Depends(require_authentication)) -> UserResponse:
    """Endpoint to retrieve the current authenticated user's information."""
    return UserResponse.model_validate(user)


@users_router.patch("/me/preferences", response_model=UserResponse)
async def patch_me_preferences(preferences_request: UpdateUserPreferencesRequest, session: DBSession, user: User = Depends(require_authentication)) -> UserResponse:
    """Endpoint to update the current authenticated user's preferences."""
    updated_user = await update_user_preferences(user.get_user_id(), preferences_request.theme, session)
    return UserResponse.model_validate(updated_user)


@users_router.patch("/me/password", status_code=204, response_model=None)
async def patch_me_password(body: ChangePasswordRequest, session: DBSession, user: User = Depends(require_authentication)) -> None:
    """Endpoint to change the current authenticated user's password."""
    await change_user_password(user.get_user_id(), body.current_password, body.new_password, body.confirm_new_password, session)


@users_router.post("/logout", response_model=bool)
async def post_logout_user(request: Request) -> bool:
    """Endpoint to log out the current user."""
    request.session.pop("user", None)
    return True
