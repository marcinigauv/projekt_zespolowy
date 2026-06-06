import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Platform, useWindowDimensions } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { useRouteAccess } from '../../src/auth/useRouteAccess'
import { Header } from '../../src/components/Header'
import { StateMessageCard } from '../../src/components/StateMessageCard'
import { formatCurrency, formatDateTime } from '../../src/lib/formatters'
import { listOrdersUseCase } from '../../src/orders/useCases'
import { getPaymentStatusLabel, getPaymentTone } from '../../src/payments/useCases'
import { useOrdersStore } from '../../src/store/ordersStore'
import {
  CardHeaderStrip,
  DataRow,
  Eyebrow,
  InfoTile,
  InfoTileLabel,
  InfoTileMeta,
  InfoTileValue,
  InfoTileValueAccent,
  MetricTile,
  PageContent,
  PageWrapper,
  PrimaryButton,
  SecondaryButton,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  StatusBadge,
  StatusBadgeText,
  SurfaceCard,
} from '../../src/components/styled'

export default function OrdersScreen() {
  const router = useRouter()
  const { width: viewportWidth } = useWindowDimensions()
  const { canRender, isAuthenticated } = useRouteAccess()
  const cachedOrders = useOrdersStore((state) => state.orders)
  const [isLoading, setIsLoading] = useState(cachedOrders.length === 0)
  const [error, setError] = useState('')
  const isNative = Platform.OS !== 'web'
  const isPhone = isNative || viewportWidth <= 520
  const isStacked = isNative || viewportWidth <= 1100
  const mobileBottomRailInset = isNative ? 112 : isPhone ? 88 : 0
  const floatingOverlayInset = isPhone ? 0 : 24
  const scrollBottomInset = mobileBottomRailInset + floatingOverlayInset
  const webOverlayToastInset = Platform.OS === 'web' && !isPhone && viewportWidth <= 1200 ? 44 : 0

  useEffect(() => {
    if (!canRender) {
      return
    }

    let isMounted = true

    const loadOrders = async () => {
      try {
        setError('')
        setIsLoading(true)

        await listOrdersUseCase()

        if (!isMounted) {
          return
        }
      } catch (caughtError) {
        if (!isMounted) {
          return
        }

        setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się pobrać historii zamówień')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [canRender, isAuthenticated])

  if (!canRender) {
    return null
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView style={{ flex: 1, marginBottom: scrollBottomInset }}>
        <PageContent style={{ maxWidth: 1120, paddingTop: webOverlayToastInset }}>
          <SectionHeading style={{ maxWidth: 760 }}>
            <Eyebrow>Zamówienia</Eyebrow>
            <SectionTitle>Historia zamówień</SectionTitle>
            <SectionDescription>
              Sprawdź listę swoich zamówień, przejrzyj szczegóły każdego z nich
            </SectionDescription>
          </SectionHeading>

          {isLoading ? (
            <StateMessageCard icon="…" message="Ładowanie zamówień" />
          ) : error ? (
            <StateMessageCard icon="!" message={error} tone="danger" />
          ) : cachedOrders.length === 0 ? (
            <StateMessageCard icon="∅" message="Nie masz jeszcze żadnych zamówień" />
          ) : (
            <YStack gap="$4">
              {cachedOrders.map((order) => (
                <SurfaceCard key={order.id} style={{ padding: 0, overflow: 'hidden' }}>
                  <YStack>
                    <CardHeaderStrip>
                      <XStack
                        gap="$3"
                        flexDirection={isStacked ? 'column' : 'row'}
                        style={{
                          justifyContent: 'space-between',
                          alignItems: isStacked ? 'stretch' : 'center',
                        }}
                      >
                        <YStack
                          gap="$1.5"
                          style={{
                            minWidth: 0,
                            flex: isStacked ? undefined : 1,
                            width: isStacked ? '100%' : undefined,
                          }}
                        >
                          <InfoTileLabel>
                          Zamówienie
                          </InfoTileLabel>
                          <Text color="$color" fontFamily="$heading" fontSize={isPhone ? '$6' : '$7'} fontWeight="700">
                          #{order.id}
                          </Text>
                          {!isStacked ? (
                            <InfoTileMeta>
                            {formatDateTime(order.orderDate)}
                            </InfoTileMeta>
                          ) : null}
                        </YStack>

                        <MetricTile
                          style={{
                            alignItems: isStacked ? 'flex-start' : 'flex-end',
                            minWidth: isStacked ? 0 : 180,
                            width: isStacked ? '100%' : undefined,
                            flexGrow: 0,
                            paddingVertical: 12,
                          }}
                        >
                          <InfoTileLabel>
                          Łączna kwota
                          </InfoTileLabel>
                          <InfoTileValueAccent style={{ fontFamily: 'Inter_700Bold', fontSize: isPhone ? 24 : 28, lineHeight: isPhone ? 30 : 34 }}>
                          {formatCurrency(order.totalAmount)}
                          </InfoTileValueAccent>
                        </MetricTile>
                      </XStack>
                    </CardHeaderStrip>

                    <YStack p="$3.5" gap="$3.5">
                      <XStack
                        gap="$3"
                        flexWrap={isStacked ? 'nowrap' : 'wrap'}
                        flexDirection={isStacked ? 'column' : 'row'}
                        style={{ alignItems: 'stretch' }}
                      >
                        <InfoTile style={{ width: isStacked ? '100%' : undefined, flexBasis: isStacked ? 'auto' : 220 }}>
                          <InfoTileLabel>
                            Data
                          </InfoTileLabel>
                          <InfoTileValue style={{ fontSize: 18, lineHeight: 24 }}>
                            {formatDateTime(order.orderDate)}
                          </InfoTileValue>
                        </InfoTile>

                        <InfoTile style={{ width: isStacked ? '100%' : undefined, flexBasis: isStacked ? 'auto' : 180 }}>
                          <InfoTileLabel>
                            Liczba pozycji
                          </InfoTileLabel>
                          <InfoTileValue>
                            {order.items.length}
                          </InfoTileValue>
                        </InfoTile>

                        <MetricTile style={{ width: isStacked ? '100%' : undefined, flexBasis: isStacked ? 'auto' : 220 }} gap="$2.5">
                          <InfoTileLabel>
                            Płatność
                          </InfoTileLabel>
                          <StatusBadge tone={getPaymentTone(order.payment?.status)}>
                            <StatusBadgeText tone={getPaymentTone(order.payment?.status)}>
                              {getPaymentStatusLabel(order.payment?.status)}
                            </StatusBadgeText>
                          </StatusBadge>
                        </MetricTile>
                      </XStack>

                      <YStack
                        width="100%"
                        borderTopWidth={1}
                        borderTopColor="$borderColor"
                        style={{
                          alignItems: isStacked ? 'stretch' : 'center',
                          paddingTop: 14,
                        }}
                      >
                        <SecondaryButton
                          size="$4"
                          onPress={() => router.push(`/orders/${order.id}`)}
                          style={{
                            minHeight: 56,
                            minWidth: isStacked ? undefined : 240,
                            width: isStacked ? '100%' : undefined,
                          }}
                        >
                          Zobacz szczegóły
                        </SecondaryButton>
                      </YStack>
                    </YStack>
                  </YStack>
                </SurfaceCard>
              ))}
            </YStack>
          )}

          <YStack style={{ width: '100%', alignItems: isStacked ? 'stretch' : 'center' }}>
            <SecondaryButton
              onPress={() => router.push('/profile')}
              style={{
                minHeight: 56,
                minWidth: isStacked ? undefined : 240,
                width: isStacked ? '100%' : undefined,
              }}
            >
              Wróć do profilu
            </SecondaryButton>
          </YStack>
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}