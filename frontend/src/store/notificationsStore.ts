import { create } from 'zustand'

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
  if (!notification.expiresAt) {
    return false
  }

  const timestamp = Date.parse(notification.expiresAt)

  if (Number.isNaN(timestamp)) {
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

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
      dismissedIds: state.dismissedIds.includes(id) ? state.dismissedIds : [...state.dismissedIds, id],
    }))
  },
}))