import { getNotificationsApi, type NotificationDto } from './api'
import { useNotificationsStore, type NotificationItem } from '../store/notificationsStore'

function isNotificationExpired(expiresAt?: string): boolean {
  if (!expiresAt) {
    return false
  }

  const timestamp = Date.parse(expiresAt)

  if (Number.isNaN(timestamp)) {
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

export async function pollNotificationsUseCase(): Promise<void> {
  const notifications = await getNotificationsApi()
  const nextItems = notifications
    .filter((notification) => notification.message.trim().length > 0)
    .filter((notification) => !isNotificationExpired(notification.expiresAt))
    .map(toNotificationItem)

  useNotificationsStore.getState().setNotifications(nextItems)
}