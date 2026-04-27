import { getNotificationsApi, type NotificationDto } from './api'
import { useNotificationsStore, type NotificationItem } from '../store/notificationsStore'

function parseNotificationTimestamp(expiresAt?: string): number | null {
  if (!expiresAt) {
    return null
  }

  const normalizedExpiresAt = /[zZ]|[+-]\d{2}:\d{2}$/.test(expiresAt)
    ? expiresAt
    : `${expiresAt}Z`
  const timestamp = Date.parse(normalizedExpiresAt)

  return Number.isNaN(timestamp) ? null : timestamp
}

function isNotificationExpired(expiresAt?: string): boolean {
  const timestamp = parseNotificationTimestamp(expiresAt)

  if (timestamp === null) {
    return false
  }

  return timestamp <= Date.now()
}

function toNotificationItem(notification: NotificationDto): NotificationItem {
  return {
    id: `${notification.message}|${notification.url ?? ''}|${notification.expiresAt ?? ''}`,
    message: notification.message,
    url: notification.url,
    expiresAt: notification.expiresAt,
  }
}

export async function loadNotificationsUseCase(): Promise<NotificationItem[]> {
  const notification = await getNotificationsApi()

  return notification.message.trim().length > 0 && !isNotificationExpired(notification.expiresAt)
    ? [toNotificationItem(notification)]
    : []
}

export async function pollNotificationsUseCase(): Promise<void> {
  const nextItems = await loadNotificationsUseCase()
  useNotificationsStore.getState().setNotifications(nextItems)
}