import React from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Button, Card, H2, Separator, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
import { useAuthStore } from '../src/store/authStore'
import { useCartStore } from '../src/store/cartStore'
import { PageWrapper, PageContent } from '../src/components/styled'

export default function Profile() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const clearCart = useCartStore(s => s.clearCart)

  if (!isAuthenticated) {
    router.replace('/login')
    return null
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent>
          <H2>Moje konto</H2>
          <Card bordered elevate>
            <Card.Header padded>
              <YStack gap="$3">
                <XStack jc="space-between" ai="center">
                  <Text color="$gray10">Imię</Text>
                  <Text fontWeight="bold">{user?.name}</Text>
                </XStack>
                <Separator />
                <XStack jc="space-between" ai="center">
                  <Text color="$gray10">Email</Text>
                  <Text fontWeight="bold">{user?.email}</Text>
                </XStack>
              </YStack>
            </Card.Header>
          </Card>
          <Button size="$5" theme="red" onPress={() => { logout(); clearCart(); router.replace('/') }}>
            Wyloguj się
          </Button>
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
