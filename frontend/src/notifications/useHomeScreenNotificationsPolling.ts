import { useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { loadNotificationsUseCase } from './useCases'
import { useNotificationsStore } from '../store/notificationsStore'

const NOTIFICATIONS_POLL_INTERVAL_MS = 30000

function useScreenNotificationsPollingImpl() {
  const setNotifications = useNotificationsStore((state) => state.setNotifications)
  const clearNotifications = useNotificationsStore((state) => state.clearNotifications)

  useFocusEffect(
    useCallback(() => {
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

        clearNotifications()
      }
    }, [clearNotifications, setNotifications]),
  )
}

export const useHomeScreenNotificationsPolling = useScreenNotificationsPollingImpl
export const useScreenNotificationsPolling = useScreenNotificationsPollingImpl