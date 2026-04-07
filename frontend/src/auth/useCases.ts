import { ApiError } from '../lib/api'
import { useAuthStore, type User } from '../store/authStore'
import { loginUserApi, registerUserApi, type AuthUserDto } from './api'

export class InvalidAuthInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidAuthInputError'
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Nieprawidłowy email lub hasło')
    this.name = 'InvalidCredentialsError'
  }
}

export class UserAlreadyExistsError extends Error {
  constructor() {
    super('Użytkownik z tym adresem email już istnieje')
    this.name = 'UserAlreadyExistsError'
  }
}

export class AuthServiceUnavailableError extends Error {
  constructor() {
    super('Usługa autoryzacji jest chwilowo niedostępna')
    this.name = 'AuthServiceUnavailableError'
  }
}

interface LoginCommand {
  email: string
  password: string
}

interface RegisterCommand {
  name: string
  email: string
  password: string
}

function toAuthUser(user: AuthUserDto): User {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    surname: user.surname,
  }
}

function setAuthenticatedUser(user: AuthUserDto): User {
  const mappedUser = toAuthUser(user)
  useAuthStore.getState().setSession(mappedUser)
  return mappedUser
}

function parseName(value: string): { name: string; surname: string } {
  const normalized = value.trim().replace(/\s+/g, ' ')
  const [name, ...surnameParts] = normalized.split(' ')
  return {
    name,
    surname: surnameParts.join(' ') || name,
  }
}

function mapAuthError(error: unknown, mode: 'login' | 'register'): Error {
  if (error instanceof ApiError) {
    if (mode === 'login' && error.status === 401) {
      return new InvalidCredentialsError()
    }

    if (mode === 'register' && error.status === 400) {
      return new UserAlreadyExistsError()
    }

    return new AuthServiceUnavailableError()
  }

  return error instanceof Error ? error : new AuthServiceUnavailableError()
}

export async function loginUserUseCase(command: LoginCommand): Promise<User> {
  const email = command.email.trim()
  const password = command.password.trim()

  if (!email || !password) {
    throw new InvalidAuthInputError('Email i hasło są wymagane')
  }

  try {
    const user = await loginUserApi({ email, password })
    return setAuthenticatedUser(user)
  } catch (error) {
    throw mapAuthError(error, 'login')
  }
}

export async function registerUserUseCase(command: RegisterCommand): Promise<User> {
  const fullName = command.name.trim()
  const email = command.email.trim()
  const password = command.password.trim()

  if (!fullName || !email || !password) {
    throw new InvalidAuthInputError('Wszystkie pola są wymagane')
  }

  const { name, surname } = parseName(fullName)

  try {
    const user = await registerUserApi({
      name,
      surname,
      email,
      password,
    })

    return setAuthenticatedUser(user)
  } catch (error) {
    throw mapAuthError(error, 'register')
  }
}