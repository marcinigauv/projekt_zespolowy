import { apiRequest } from '../lib/api'

export interface NotificationDto {
  message: string
  url?: string
  expiresAt?: string
}

export async function getNotificationsApi(): Promise<NotificationDto> {
  return apiRequest<NotificationDto>('/notifications/', {
    method: 'GET',
  })
}