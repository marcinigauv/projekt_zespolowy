import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { YStack } from 'tamagui'
import { AskAiChatPanel } from '../src/ask_ai/components/AskAiChatPanel'
import { useAskAiChat } from '../src/ask_ai/useAskAiChat'
import { Header } from '../src/components/Header'
import { useRouteAccess } from '../src/auth/useRouteAccess'
import { PageContent, PageWrapper } from '../src/components/styled'

const PHONE_BREAKPOINT = 520

export default function AskAiScreen() {
  const { canRender, isAuthResolved } = useRouteAccess()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isPhone = width <= PHONE_BREAKPOINT
  const contentPaddingBottom = isPhone ? 64 : 132
  const controller = useAskAiChat({
    enabled: canRender && isPhone,
    autoInitialize: canRender && isPhone,
  })

  useEffect(() => {
    if (isAuthResolved && canRender && !isPhone) {
      router.replace('/')
    }
  }, [canRender, isAuthResolved, isPhone, router])

  if (!isAuthResolved || !canRender || !isPhone) {
    return null
  }

  return (
    <PageWrapper>
      <Header />
      <PageContent style={{ flex: 1, minHeight: 0, maxWidth: 920, paddingTop: 8, paddingBottom: contentPaddingBottom }}>
        <YStack style={{ flex: 1, minHeight: 0 }}>
          <AskAiChatPanel controller={controller} variant="page" />
        </YStack>
      </PageContent>
    </PageWrapper>
  )
}