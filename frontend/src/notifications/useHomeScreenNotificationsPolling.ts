import { useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { usePathname } from 'expo-router'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { loadNotificationsUseCase } from './useCases'
import { useNotificationsStore } from '../store/notificationsStore'

const NOTIFICATIONS_POLL_INTERVAL_MS = 30000
let lastDeliveredNotificationId: string | null = null

function useScreenNotificationsPollingImpl() {
  const pathname = usePathname()
  const setNotifications = useNotificationsStore((state) => state.setNotifications)
  const clearNotifications = useNotificationsStore((state) => state.clearNotifications)
  const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios'
  const isNotificationsEnabledRoute = pathname === '/' || pathname.startsWith('/products/')
  const shouldPollNotifications = !isNativeMobile || isNotificationsEnabledRoute

  useFocusEffect(
    useCallback(() => {
      if (!shouldPollNotifications) {
        clearNotifications()
        return () => {}
      }

      let isActive = true
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      let isPolling = false

      const scheduleNext = () => {
        if (!isActive) {
          return
        }

        timeoutId = setTimeout(() => {
          void runPoll()
        }, NOTIFICATIONS_POLL_INTERVAL_MS)
      }

      const runPoll = async () => {
        if (!isActive || isPolling) {
          return
        }

        isPolling = true

        try {
          const notifications = await loadNotificationsUseCase()

          if (!isActive) {
            return
          }

          setNotifications(notifications)

          if (Platform.OS === 'android') {
            const nextNotification = notifications[0]

            if (nextNotification && lastDeliveredNotificationId !== nextNotification.id) {
              lastDeliveredNotificationId = nextNotification.id

              try {
                await Notifications.dismissAllNotificationsAsync()

                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Powiadomienie',
                    body: nextNotification.message,
                    data: {
                      url: nextNotification.url ?? null,
                      id: nextNotification.id,
                    },
                  },
                  trigger: null,
                })
              } catch {
              }
            }
          }
        } finally {
          isPolling = false

          if (isActive) {
            scheduleNext()
          }
        }
      }

      void runPoll()

      return () => {
        isActive = false

        if (timeoutId !== null) {
          clearTimeout(timeoutId)
        }
      }
    }, [clearNotifications, setNotifications, shouldPollNotifications]),
  )
}

export const useHomeScreenNotificationsPolling = useScreenNotificationsPollingImpl
export const useScreenNotificationsPolling = useScreenNotificationsPollingImpl