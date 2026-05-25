import 'expo-sqlite/localStorage/install'
import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { Platform } from 'react-native'
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
import { NotificationsToastHost } from '../src/components/NotificationsToastHost'
import { useAuthStore } from '../src/store/authStore'
import { DEFAULT_THEME_PREFERENCE, resolveThemePreference } from '../src/theme/options'
import tamaguiConfig from '../tamagui.config'

export default function RootLayout() {
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

  if (!loaded || !isAuthResolved) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={activeTheme}>
        <Theme name={activeTheme} forceClassName>
          <YStack flex={1} pt={Platform.OS === 'web' ? 0 : mobileNotificationsInset}>
            <Stack screenOptions={{ headerShown: false }} />
          </YStack>

          <NotificationsToastHost onMobileInsetChange={setMobileNotificationsInset} />
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
