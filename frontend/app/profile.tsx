import React from 'react'
import { useRouter } from 'expo-router'
import { YStack, Text, Separator, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
import { useRouteAccess } from '../src/auth/useRouteAccess'
import { logoutUserUseCase } from '../src/auth/useCases'
import {
  ActionButtonRow,
  DataRow,
  PageWrapper,
  PageContent,
  Eyebrow,
  PrimaryButton,
  SecondaryButton,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  SurfaceCard,
} from '../src/components/styled'

export default function Profile() {
  const router = useRouter()
  const { canRender, user } = useRouteAccess()

  if (!canRender) {
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
              Tu znajdziesz informacje o swoim koncie oraz podejrzysz historię swoich zamówień.
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
                <Text color="$gray10">Nazwisko</Text>
                <Text fontWeight="700">{user?.surname}</Text>
              </DataRow>
              <Separator />
              <DataRow>
                <Text color="$gray10">Email</Text>
                <Text fontWeight="700">{user?.email}</Text>
              </DataRow>
            </YStack>
          </SurfaceCard>

          <ActionButtonRow>
            <SecondaryButton onPress={() => router.push('/orders')}>
              Historia zamówień
            </SecondaryButton>
            <PrimaryButton theme="danger" onPress={() => { void (async () => { await logoutUserUseCase(); router.replace('/') })() }}>
              Wyloguj się
            </PrimaryButton>
          </ActionButtonRow>
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
