import { apiRequest } from '../lib/api'

export interface AuthUserDto {
  id: number
  email: string
  name: string
  surname: string
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

export async function loginUserApi(payload: LoginPayload): Promise<AuthUserDto> {
  return apiRequest<AuthUserDto>('/users/login', {
    method: 'POST',
    body: payload,
  })
}

export async function registerUserApi(payload: RegisterPayload): Promise<AuthUserDto> {
  return apiRequest<AuthUserDto>('/users/register', {
    method: 'POST',
    body: payload,
  })
}