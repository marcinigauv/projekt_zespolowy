import 'expo-sqlite/localStorage/install'
import { useEffect, useRef } from 'react'
import { Stack } from 'expo-router'
import { AppState, Platform } from 'react-native'
import { TamaguiProvider } from 'tamagui'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { hydrateAuthSessionUseCase } from '../src/auth/useCases'
import { NotificationsToastHost } from '../src/components/NotificationsToastHost'
import { pollNotificationsUseCase } from '../src/notifications/useCases'
import { useAuthStore } from '../src/store/authStore'
import tamaguiConfig from '../tamagui.config'

const NOTIFICATIONS_POLL_INTERVAL_MS = 20000

export default function RootLayout() {
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved)
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const appStateRef = useRef(AppState.currentState)
  const isWindowFocusedRef = useRef(Platform.OS !== 'web' || typeof document === 'undefined' ? true : document.hasFocus())
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    void hydrateAuthSessionUseCase()
  }, [])

  useEffect(() => {
    const stopPolling = () => {
      if (pollingIntervalRef.current !== null) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }

    const startPolling = () => {
      if (pollingIntervalRef.current !== null) {
        return
      }

      void pollNotificationsUseCase()
      pollingIntervalRef.current = setInterval(() => {
        void pollNotificationsUseCase()
      }, NOTIFICATIONS_POLL_INTERVAL_MS)
    }

    const syncPolling = () => {
      const isAppActive = appStateRef.current === 'active'
      const shouldPoll = Platform.OS === 'web'
        ? isAppActive && isWindowFocusedRef.current
        : isAppActive

      if (shouldPoll) {
        startPolling()
        return
      }

      stopPolling()
    }

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState
      syncPolling()
    })

    let handleFocus: (() => void) | null = null
    let handleBlur: (() => void) | null = null

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      handleFocus = () => {
        isWindowFocusedRef.current = true
        syncPolling()
      }

      handleBlur = () => {
        isWindowFocusedRef.current = false
        syncPolling()
      }

      window.addEventListener('focus', handleFocus)
      window.addEventListener('blur', handleBlur)
    }

    syncPolling()

    return () => {
      appStateSubscription.remove()
      stopPolling()

      if (Platform.OS === 'web' && typeof window !== 'undefined' && handleFocus && handleBlur) {
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('blur', handleBlur)
      }
    }
  }, [])

  if (!loaded || !isAuthResolved) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <Stack screenOptions={{ headerShown: false }} />
        <NotificationsToastHost />
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
