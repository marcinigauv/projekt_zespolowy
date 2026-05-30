import { apiRequest } from '../lib/api'
import type { ThemePreference } from '../theme/options'

export interface AuthUserDto {
  id: number
  email: string
  name: string
  surname: string
  isAdmin: boolean
  userPreferences?: {
    theme?: ThemePreference | string
  }
}

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  surname: string
  email: string
  password: string
}

interface UpdateUserPreferencesPayload {
  theme: ThemePreference
}

export async function loginUserApi(payload: LoginPayload): Promise<AuthUserDto> {
  return apiRequest<AuthUserDto>('/users/login', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchCurrentUserApi(): Promise<AuthUserDto> {
  return apiRequest<AuthUserDto>('/users/me', {
    method: 'GET',
  })
}

export async function registerUserApi(payload: RegisterPayload): Promise<AuthUserDto> {
  return apiRequest<AuthUserDto>('/users/register', {
    method: 'POST',
    body: payload,
  })
}

export async function logoutUserApi(): Promise<boolean> {
  return apiRequest<boolean>('/users/logout', {
    method: 'POST',
  })
}

export async function updateUserPreferencesApi(payload: UpdateUserPreferencesPayload): Promise<AuthUserDto> {
  return apiRequest<AuthUserDto>('/users/me/preferences', {
    method: 'PATCH',
    body: payload,
  })
}

interface ChangePasswordPayload {
  current_password: string
  new_password: string
  confirm_new_password: string
}

export async function changePasswordApi(payload: ChangePasswordPayload): Promise<void> {
  await apiRequest<null>('/users/me/password', {
    method: 'PATCH',
    body: payload,
  })
}