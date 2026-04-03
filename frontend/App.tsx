import React from 'react'
import { useFonts } from 'expo-font'
import { TamaguiProvider, YStack, Text, Button } from 'tamagui'
import tamaguiConfig from './tamagui.config'

export default function App() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  if (!loaded) return null

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <YStack f={1} ai="center" jc="center" gap="$4" bg="$background" p="$4">
        <Text fontSize="$8">Hello Tamagui</Text>
        <Button>Test button</Button>
      </YStack>
    </TamaguiProvider>
  )
}