import { create } from 'zustand'

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

export interface NotificationItem {
  id: string
  message: string
  url?: string
  expiresAt?: string
}

interface NotificationsState {
  notifications: NotificationItem[]
  dismissedIds: string[]
  setNotifications: (notifications: NotificationItem[]) => void
  clearNotifications: () => void
  dismissNotification: (id: string) => void
}

function areNotificationsEqual(left: NotificationItem[], right: NotificationItem[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  return left.every((notification, index) => {
    const other = right[index]

    return other !== undefined
      && notification.id === other.id
      && notification.message === other.message
      && notification.url === other.url
      && notification.expiresAt === other.expiresAt
  })
}

function isExpired(notification: NotificationItem): boolean {
  const timestamp = parseNotificationTimestamp(notification.expiresAt)

  if (timestamp === null) {
    return false
  }

  return timestamp <= Date.now()
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  dismissedIds: [],

  setNotifications: (notifications) => {
    set((state) => {
      const dismissedIds = new Set(state.dismissedIds)
      const activeNotifications = notifications
        .filter((notification) => !isExpired(notification))
        .filter((notification) => !dismissedIds.has(notification.id))

      if (areNotificationsEqual(state.notifications, activeNotifications)) {
        return state
      }

      return {
        notifications: activeNotifications,
      }
    })
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
      dismissedIds: state.dismissedIds.includes(id) ? state.dismissedIds : [...state.dismissedIds, id],
    }))
  },
}))