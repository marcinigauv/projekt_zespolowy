import React from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Separator, ScrollView, useMedia } from 'tamagui'
import { Header } from '../src/components/Header'
import { useAuthStore } from '../src/store/authStore'
import { useCartStore } from '../src/store/cartStore'
import {
  PageWrapper,
  PageContent,
  Eyebrow,
  PrimaryButton,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  SurfaceCard,
} from '../src/components/styled'

export default function Profile() {
  const router = useRouter()
  const media = useMedia()
  const { user, isAuthenticated, logout } = useAuthStore()
  const clearCart = useCartStore(s => s.clearCart)
  const isCompact = media.sm

  if (!isAuthenticated) {
    router.replace('/login')
    return null
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent>
          <SectionHeading>
            <Eyebrow>Profil</Eyebrow>
            <SectionTitle>Moje konto</SectionTitle>
            <SectionDescription>
              Dane konta i akcje krytyczne korzystają z tego samego systemu powierzchni oraz CTA co reszta aplikacji.
            </SectionDescription>
          </SectionHeading>

          <SurfaceCard>
            <YStack gap="$3">
              <XStack gap="$3" style={{ justifyContent: 'space-between', alignItems: isCompact ? 'flex-start' : 'center', flexWrap: 'wrap' }}>
                <Text color="$gray10">Imię</Text>
                <Text fontWeight="700">{user?.name}</Text>
              </XStack>
              <Separator />
              <XStack gap="$3" style={{ justifyContent: 'space-between', alignItems: isCompact ? 'flex-start' : 'center', flexWrap: 'wrap' }}>
                <Text color="$gray10">Email</Text>
                <Text fontWeight="700">{user?.email}</Text>
              </XStack>
            </YStack>
          </SurfaceCard>

          <PrimaryButton theme="danger" onPress={() => { logout(); clearCart(); router.replace('/') }}>
            Wyloguj się
          </PrimaryButton>
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
