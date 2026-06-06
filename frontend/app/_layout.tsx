import 'expo-sqlite/localStorage/install'
import { useEffect, useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import { Platform } from 'react-native'
import * as ExpoLinking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { TamaguiProvider, Theme, YStack } from 'tamagui'
import { useFonts } from 'expo-font'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter'
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { hydrateAuthSessionUseCase } from '../src/auth/useCases'
import { AskAiFloatingWidget } from '../src/ask_ai/components/AskAiFloatingWidget'
import { NotificationsToastHost } from '../src/components/NotificationsToastHost'
import { useAuthStore } from '../src/store/authStore'
import { DEFAULT_THEME_PREFERENCE, resolveThemePreference } from '../src/theme/options'
import tamaguiConfig from '../tamagui.config'

function resolveNotificationProductPath(url: unknown): string | null {
  if (typeof url !== 'string') {
    return null
  }

  const trimmed = url.trim()
  if (trimmed.startsWith('/products/')) {
    return trimmed
  }

  return null
}

function appendQueryParam(params: string[], key: string, value: string | string[] | undefined): void {
  if (Array.isArray(value)) {
    value.forEach((item) => appendQueryParam(params, key, item))
    return
  }

  if (value === undefined) {
    return
  }

  params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
}

function resolvePaymentReturnPath(url: string): string | null {
  const parsedUrl = ExpoLinking.parse(url)
  const rawPath = parsedUrl.path?.replace(/^\/+/, '') ?? ''
  const rawHostname = parsedUrl.hostname ?? ''
  const pathWithHost = rawHostname === 'orders' && rawPath ? `orders/${rawPath}` : rawPath
  const path = pathWithHost.replace(/^--\//, '')

  if (path !== 'orders' && !path.startsWith('orders/')) {
    return null
  }

  const pathParts = path.split('/').filter(Boolean)
  const orderId = pathParts[0] === 'orders' ? pathParts[1] : undefined
  const targetPath = orderId ? `/orders/${orderId}` : '/orders'
  const queryParams = parsedUrl.queryParams ?? {}
  const params: string[] = []

  Object.entries(queryParams).forEach(([key, value]) => {
    appendQueryParam(params, key, value)
  })

  if (!('paymentReturn' in queryParams)) {
    params.push('paymentReturn=1')
  }

  if (orderId && !('orderId' in queryParams)) {
    params.push(`orderId=${encodeURIComponent(orderId)}`)
  }

  return params.length > 0 ? `${targetPath}?${params.join('&')}` : targetPath
}

export default function RootLayout() {
  const router = useRouter()
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved)
  const activeThemePreference = useAuthStore((state) => state.user?.userPreferences.theme)
  const activeTheme = resolveThemePreference(activeThemePreference ?? DEFAULT_THEME_PREFERENCE)
  const [mobileNotificationsInset, setMobileNotificationsInset] = useState(0)
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    JetBrainsMono_500Medium,
  })

  useEffect(() => {
    void hydrateAuthSessionUseCase()
  }, [])

  useEffect(() => {
    if (!isAuthResolved || Platform.OS === 'web') {
      return
    }

    const openPaymentReturn = (url: string) => {
      const paymentReturnPath = resolvePaymentReturnPath(url)

      if (paymentReturnPath) {
        router.replace(paymentReturnPath)
      }
    }

    void ExpoLinking.getInitialURL().then((url) => {
      if (url) {
        openPaymentReturn(url)
      }
    })

    const subscription = ExpoLinking.addEventListener('url', (event) => {
      openPaymentReturn(event.url)
    })

    return () => {
      subscription.remove()
    }
  }, [isAuthResolved, router])

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    })

    void (async () => {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Domyslne',
        importance: Notifications.AndroidImportance.DEFAULT,
      })

      const permissions = await Notifications.getPermissionsAsync()
      if (!permissions.granted) {
        await Notifications.requestPermissionsAsync()
      }
    })()

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = resolveNotificationProductPath(response.notification.request.content.data?.url)

      if (route) {
        router.push(route)
      }
    })

    return () => {
      responseSubscription.remove()
    }
  }, [router])

  if (!loaded || !isAuthResolved) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={activeTheme}>
        <Theme name={activeTheme} forceClassName>
          <YStack flex={1} pb={Platform.OS === 'web' ? 0 : mobileNotificationsInset}>
            <YStack flex={1}>
              <Stack screenOptions={{ headerShown: false }} />
              <AskAiFloatingWidget />
            </YStack>
          </YStack>

          {Platform.OS === 'web' ? (
            <NotificationsToastHost onMobileInsetChange={setMobileNotificationsInset} />
          ) : null}
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
