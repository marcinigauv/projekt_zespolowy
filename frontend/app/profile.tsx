import React from 'react'
import { useRouter } from 'expo-router'
import { useWindowDimensions } from 'react-native'
import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
import { useRouteAccess } from '../src/auth/useRouteAccess'
import { logoutUserUseCase } from '../src/auth/useCases'
import {
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
  const { width: viewportWidth } = useWindowDimensions()
  const isPhone = viewportWidth <= 520

  const infoCardStyle = {
    minWidth: 0,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#cbc4d2',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  } as const

  if (!canRender) {
    return null
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent style={{ maxWidth: 1120 }}>
          <SectionHeading style={{ maxWidth: 760 }}>
            <Eyebrow>Profil</Eyebrow>
            <SectionTitle>Moje konto</SectionTitle>
            <SectionDescription>
              Tu znajdziesz informacje o swoim koncie oraz podejrzysz historię swoich zamówień.
            </SectionDescription>
          </SectionHeading>

          <SurfaceCard style={{ padding: 0, overflow: 'hidden' }}>
            <YStack>
              <YStack
                gap="$2"
                px="$4.5"
                py="$4.5"
                style={{
                  backgroundColor: '#f8f2fa',
                  borderBottomWidth: 1,
                  borderBottomColor: '#e6e0e9',
                }}
              >
                <Text color="$placeholderColor" fontSize="$2" fontWeight="700" letterSpacing={0.6} textTransform="uppercase">
                  Dane konta
                </Text>
                <Text color="$color" fontFamily="$heading" fontSize="$8" fontWeight="600">
                  {user?.name} {user?.surname}
                </Text>
                <Text color="$placeholderColor" fontSize="$4">
                  {user?.email}
                </Text>
              </YStack>

              <YStack p="$3.5" gap="$3.5">
                <XStack gap="$3" flexWrap="wrap">
                  <YStack flexBasis={240} style={infoCardStyle}>
                    <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                      Imię
                    </Text>
                    <Text color="$color" fontSize="$5" fontWeight="700">
                      {user?.name}
                    </Text>
                  </YStack>

                  <YStack flexBasis={240} style={infoCardStyle}>
                    <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                      Nazwisko
                    </Text>
                    <Text color="$color" fontSize="$5" fontWeight="700">
                      {user?.surname}
                    </Text>
                  </YStack>
                </XStack>

                <YStack style={infoCardStyle}>
                  <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                    Email
                  </Text>
                  <Text color="$color" fontSize="$5" fontWeight="700">
                    {user?.email}
                  </Text>
                </YStack>

                <YStack
                  gap="$2.5"
                  pt="$3"
                  borderTopWidth={1}
                  borderColor="$borderColor"
                >
                  <Text color="$placeholderColor" fontSize="$2" fontWeight="700" letterSpacing={0.6} textTransform="uppercase">
                    Szybkie akcje
                  </Text>

                  <YStack
                    alignItems={isPhone ? 'stretch' : 'center'}
                    style={{
                      width: '100%',
                      borderWidth: 1,
                      borderColor: '#cbc4d2',
                      borderRadius: 20,
                      backgroundColor: '#f8f2fa',
                      padding: isPhone ? 12 : 14,
                    }}
                  >
                    <XStack
                      gap="$2.5"
                      flexDirection={isPhone ? 'column' : 'row'}
                      alignItems="stretch"
                      justifyContent="center"
                      style={{ width: isPhone ? '100%' : 'auto' }}
                    >
                      <SecondaryButton
                        onPress={() => router.push('/orders')}
                        style={{
                          minHeight: 56,
                          minWidth: isPhone ? undefined : 210,
                          width: isPhone ? '100%' : undefined,
                          backgroundColor: '#ffffff',
                          borderColor: '#cbc4d2',
                        }}
                      >
                        Historia zamówień
                      </SecondaryButton>
                      <PrimaryButton
                        theme="danger"
                        onPress={() => { void (async () => { await logoutUserUseCase(); router.replace('/') })() }}
                        style={{
                          minHeight: 56,
                          minWidth: isPhone ? undefined : 190,
                          width: isPhone ? '100%' : undefined,
                        }}
                      >
                        Wyloguj się
                      </PrimaryButton>
                    </XStack>
                  </YStack>
                </YStack>
              </YStack>
            </YStack>
          </SurfaceCard>
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
