import React from 'react'
import { useRouter } from 'expo-router'
import { useWindowDimensions } from 'react-native'
import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
import { useRouteAccess } from '../src/auth/useRouteAccess'
import { logoutUserUseCase, updateUserThemePreferenceUseCase } from '../src/auth/useCases'
import {
  CardHeaderStrip,
  PageWrapper,
  PageContent,
  Eyebrow,
  InfoTile,
  InfoTileLabel,
  InfoTileMeta,
  InfoTileValue,
  MetricTile,
  PrimaryButton,
  SecondaryButton,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  SurfaceCard,
} from '../src/components/styled'
import { THEME_OPTIONS, resolveThemePreference } from '../src/theme/options'

export default function Profile() {
  const router = useRouter()
  const { canRender, user } = useRouteAccess()
  const { width: viewportWidth } = useWindowDimensions()
  const isPhone = viewportWidth <= 520
  const [themeError, setThemeError] = React.useState('')
  const [isSavingTheme, setIsSavingTheme] = React.useState(false)

  const selectedTheme = resolveThemePreference(user?.userPreferences.theme)

  const handleThemeChange = (theme: (typeof THEME_OPTIONS)[number]['value']) => {
    if (theme === selectedTheme || isSavingTheme) {
      return
    }

    setThemeError('')
    setIsSavingTheme(true)

    void (async () => {
      try {
        await updateUserThemePreferenceUseCase(theme)
      } catch (error) {
        setThemeError(error instanceof Error ? error.message : 'Nie udało się zapisać ustawień motywu')
      } finally {
        setIsSavingTheme(false)
      }
    })()
  }

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
              <CardHeaderStrip gap="$2">
                <Text color="$placeholderColor" fontSize="$2" fontWeight="700" letterSpacing={0.6} textTransform="uppercase">
                  Dane konta
                </Text>
                <Text color="$color" fontFamily="$heading" fontSize="$8" fontWeight="600">
                  {user?.name} {user?.surname}
                </Text>
                <InfoTileMeta style={{ fontSize: 16, lineHeight: 24 }}>
                  {user?.email}
                </InfoTileMeta>
              </CardHeaderStrip>

              <YStack p="$3.5" gap="$3.5">
                <XStack gap="$3" flexWrap="wrap">
                  <InfoTile flexBasis={240}>
                    <InfoTileLabel>
                      Imię
                    </InfoTileLabel>
                    <InfoTileValue>
                      {user?.name}
                    </InfoTileValue>
                  </InfoTile>

                  <InfoTile flexBasis={240}>
                    <InfoTileLabel>
                      Nazwisko
                    </InfoTileLabel>
                    <InfoTileValue>
                      {user?.surname}
                    </InfoTileValue>
                  </InfoTile>
                </XStack>

                <InfoTile>
                  <InfoTileLabel>
                    Email
                  </InfoTileLabel>
                  <InfoTileValue>
                    {user?.email}
                  </InfoTileValue>
                </InfoTile>

                <YStack
                  gap="$2.5"
                  pt="$1"
                >
                  <Text color="$placeholderColor" fontSize="$2" fontWeight="700" letterSpacing={0.6} textTransform="uppercase">
                    Ustawienia
                  </Text>

                  <InfoTile>
                    <InfoTileLabel>
                      Motyw interfejsu
                    </InfoTileLabel>
                    <YStack gap="$2.5">
                      <XStack gap="$2" flexWrap="wrap">
                        {THEME_OPTIONS.map((themeOption) => {
                          const isActive = selectedTheme === themeOption.value

                          return (
                            <SecondaryButton
                              key={themeOption.value}
                              onPress={() => handleThemeChange(themeOption.value)}
                              disabled={isSavingTheme && !isActive}
                              borderColor={isActive ? '$stitchPrimary' : '$borderColor'}
                              bg={isActive ? '$stitchPrimaryContainer' : '$background'}
                              style={{
                                minHeight: 44,
                                opacity: isSavingTheme && !isActive ? 0.6 : 1,
                              }}
                            >
                              {themeOption.label}
                            </SecondaryButton>
                          )
                        })}
                      </XStack>


                      {themeError ? <Text color="$red10">{themeError}</Text> : null}
                    </YStack>
                  </InfoTile>
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

                  <MetricTile
                    alignItems={isPhone ? 'stretch' : 'center'}
                    style={{
                      width: '100%',
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
                  </MetricTile>
                </YStack>
              </YStack>
            </YStack>
          </SurfaceCard>
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
