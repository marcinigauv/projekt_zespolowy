import 'expo-sqlite/localStorage/install'
import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { Platform } from 'react-native'
import { TamaguiProvider, YStack } from 'tamagui'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { hydrateAuthSessionUseCase } from '../src/auth/useCases'
import { NotificationsToastHost } from '../src/components/NotificationsToastHost'
import { useAuthStore } from '../src/store/authStore'
import tamaguiConfig from '../tamagui.config'

export default function RootLayout() {
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved)
  const [mobileNotificationsInset, setMobileNotificationsInset] = useState(0)
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    InterMedium: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterSemiBold: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    InterExtraBold: require('@tamagui/font-inter/otf/Inter-ExtraBold.otf'),
  })

  useEffect(() => {
    void hydrateAuthSessionUseCase()
  }, [])

  if (!loaded || !isAuthResolved) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <YStack flex={1} pt={Platform.OS === 'web' ? 0 : mobileNotificationsInset}>
          <Stack screenOptions={{ headerShown: false }} />
        </YStack>
        <NotificationsToastHost onMobileInsetChange={setMobileNotificationsInset} />
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
