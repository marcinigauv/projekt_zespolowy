import React from 'react'
import { useRouter } from 'expo-router'
import { YStack, Text, Separator, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
import { useAuthStore } from '../src/store/authStore'
import {
  DataRow,
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
  const { user, isAuthenticated, logout } = useAuthStore()

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
              <DataRow>
                <Text color="$gray10">Imię</Text>
                <Text fontWeight="700">{user?.name}</Text>
              </DataRow>
              <Separator />
              <DataRow>
                <Text color="$gray10">Email</Text>
                <Text fontWeight="700">{user?.email}</Text>
              </DataRow>
            </YStack>
          </SurfaceCard>

          <PrimaryButton theme="danger" onPress={() => { logout(); router.replace('/') }}>
            Wyloguj się
          </PrimaryButton>
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
