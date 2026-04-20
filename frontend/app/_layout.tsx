import 'expo-sqlite/localStorage/install'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { TamaguiProvider } from 'tamagui'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { hydrateAuthSessionUseCase } from '../src/auth/useCases'
import { NotificationsToastHost } from '../src/components/NotificationsToastHost'
import { useAuthStore } from '../src/store/authStore'
import tamaguiConfig from '../tamagui.config'

export default function RootLayout() {
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved)
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    void hydrateAuthSessionUseCase()
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
