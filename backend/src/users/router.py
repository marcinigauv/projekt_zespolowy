from fastapi import APIRouter, Request, Depends
from src.sql.db import DBSession
from src.users.models import User, UserCreate, UserLogin, UserResponse
from src.users.use_cases import create_new_user, verify_user_credentials
from src.users.exceptions import InvalidCredentialsException
from src.users.dependecies import set_session_user, get_session_user


users_router = APIRouter(prefix="/users", tags=["users"])


@users_router.post("/register", response_model=UserResponse)
async def post_register_user(user_create: UserCreate, session: DBSession) -> UserResponse:
    """Endpoint to register a new user."""
    result = await create_new_user(user_create, session)
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
async def get_me_user(request: Request, user: User = Depends(get_session_user)) -> UserResponse:
    """Endpoint to retrieve the current authenticated user's information."""
    return UserResponse.model_validate(user)

@users_router.post("/logout", response_model=bool)
async def post_logout_user(request: Request) -> bool:
    """Endpoint to log out the current user."""
    request.session.pop("user", None)
    return True