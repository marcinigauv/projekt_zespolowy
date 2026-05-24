import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useWindowDimensions } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { useRouteAccess } from '../../src/auth/useRouteAccess'
import { Header } from '../../src/components/Header'
import { StateMessageCard } from '../../src/components/StateMessageCard'
import { formatCurrency, formatDateTime } from '../../src/lib/formatters'
import { listOrdersUseCase } from '../../src/orders/useCases'
import { getPaymentStatusLabel, getPaymentTone } from '../../src/payments/useCases'
import { useOrdersStore } from '../../src/store/ordersStore'
import {
  DataRow,
  Eyebrow,
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
  const isPhone = viewportWidth <= 520

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
      <ScrollView>
        <PageContent style={{ maxWidth: 1120 }}>
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
                    <XStack
                      gap="$3"
                      px="$4"
                      py="$4"
                      justifyContent="space-between"
                      alignItems={isPhone ? 'flex-start' : 'center'}
                      flexDirection={isPhone ? 'column' : 'row'}
                      style={{
                        backgroundColor: '#f8f2fa',
                        borderBottomWidth: 1,
                        borderBottomColor: '#e6e0e9',
                      }}
                    >
                      <YStack gap="$1.5" style={{ minWidth: 0, flex: 1 }}>
                        <Text color="$placeholderColor" fontSize="$2" fontWeight="700" letterSpacing={0.6} textTransform="uppercase">
                          Zamówienie
                        </Text>
                        <Text color="$color" fontFamily="$heading" fontSize={isPhone ? '$6' : '$7'} fontWeight="700">
                          #{order.id}
                        </Text>
                        <Text color="$placeholderColor" fontSize="$3">
                          {formatDateTime(order.orderDate)}
                        </Text>
                      </YStack>

                      <YStack
                        alignItems={isPhone ? 'flex-start' : 'flex-end'}
                        style={{
                          minWidth: isPhone ? 0 : 180,
                          width: isPhone ? '100%' : undefined,
                          borderWidth: 1,
                          borderColor: '#cbc4d2',
                          borderRadius: 18,
                          backgroundColor: '#ffffff',
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                        }}
                      >
                        <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                          Łączna kwota
                        </Text>
                        <Text color="$blue10" fontFamily="$heading" fontSize={isPhone ? '$6' : '$7'} fontWeight="700">
                          {formatCurrency(order.totalAmount)}
                        </Text>
                      </YStack>
                    </XStack>

                    <YStack p="$3.5" gap="$3.5">
                      <XStack gap="$3" flexWrap="wrap">
                        <YStack
                          flexBasis={220}
                          style={{
                            minWidth: 0,
                            flexGrow: 1,
                            borderWidth: 1,
                            borderColor: '#cbc4d2',
                            borderRadius: 18,
                            backgroundColor: '#ffffff',
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            gap: 6,
                          }}
                        >
                          <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                            Data
                          </Text>
                          <Text color="$color" fontSize="$4" fontWeight="700">
                            {formatDateTime(order.orderDate)}
                          </Text>
                        </YStack>

                        <YStack
                          flexBasis={180}
                          style={{
                            minWidth: 0,
                            flexGrow: 1,
                            borderWidth: 1,
                            borderColor: '#cbc4d2',
                            borderRadius: 18,
                            backgroundColor: '#ffffff',
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            gap: 6,
                          }}
                        >
                          <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                            Liczba pozycji
                          </Text>
                          <Text color="$color" fontSize="$5" fontWeight="700">
                            {order.items.length}
                          </Text>
                        </YStack>

                        <YStack
                          flexBasis={220}
                          style={{
                            minWidth: 0,
                            flexGrow: 1,
                            borderWidth: 1,
                            borderColor: '#cbc4d2',
                            borderRadius: 18,
                            backgroundColor: '#ffffff',
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            gap: 10,
                          }}
                        >
                          <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                            Płatność
                          </Text>
                          <StatusBadge tone={getPaymentTone(order.payment?.status)}>
                            <StatusBadgeText tone={getPaymentTone(order.payment?.status)}>
                              {getPaymentStatusLabel(order.payment?.status)}
                            </StatusBadgeText>
                          </StatusBadge>
                        </YStack>
                      </XStack>

                      <YStack
                        alignItems={isPhone ? 'stretch' : 'center'}
                        style={{
                          width: '100%',
                          borderTopWidth: 1,
                          borderTopColor: '#e6e0e9',
                          paddingTop: 14,
                        }}
                      >
                        <SecondaryButton
                          size="$4"
                          onPress={() => router.push(`/orders/${order.id}`)}
                          style={{
                            minHeight: 56,
                            minWidth: isPhone ? undefined : 240,
                            width: isPhone ? '100%' : undefined,
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

          <YStack alignItems={isPhone ? 'stretch' : 'center'} style={{ width: '100%' }}>
            <SecondaryButton
              onPress={() => router.push('/profile')}
              style={{
                minHeight: 56,
                minWidth: isPhone ? undefined : 240,
                width: isPhone ? '100%' : undefined,
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