import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { AppState, Platform, useWindowDimensions } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { useRouteAccess } from '../../src/auth/useRouteAccess'
import { Header } from '../../src/components/Header'
import { StateMessageCard } from '../../src/components/StateMessageCard'
import { formatCurrency, formatDateTime } from '../../src/lib/formatters'
import { parseBooleanParam, parsePositiveIntParam } from '../../src/lib/routeParams'
import { getOrderUseCase, type Order } from '../../src/orders/useCases'
import {
  createPaymentUseCase,
  getPaymentActionLabel,
  getPaymentStatusLabel,
  getPaymentTone,
  getPaymentStatusUseCase,
  isPaymentConfirmed,
  openPaymentUrlUseCase,
  shouldShowPaymentRefresh,
  type Payment,
} from '../../src/payments/useCases'
import { useOrdersStore } from '../../src/store/ordersStore'
import {
  ActionButtonRow,
  BackLinkButton,
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
  ProductPrice,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  StatusBadge,
  StatusBadgeText,
  SurfaceCard,
} from '../../src/components/styled'

function mergeOrderPayment(order: Order, payment: Payment): Order {
  return {
    ...order,
    payment: {
      id: payment.id,
      status: payment.status,
    },
  }
}

export default function OrderDetailsScreen() {
  const router = useRouter()
  const { width: viewportWidth } = useWindowDimensions()
  const params = useLocalSearchParams<{ id?: string | string[]; paymentReturn?: string | string[]; startPayment?: string | string[] }>()
  const { canRender, isAuthenticated } = useRouteAccess()
  const getOrderById = useOrdersStore((state) => state.getOrderById)
  const upsertOrder = useOrdersStore((state) => state.upsertOrder)
  const orderId = parsePositiveIntParam(params.id)
  const shouldAutoStartPayment = parseBooleanParam(params.startPayment)
  const didReturnFromPayment = parseBooleanParam(params.paymentReturn)
  const cachedOrder = orderId !== null ? getOrderById(orderId) : null
  const [order, setOrder] = useState<Order | null>(cachedOrder)
  const [isLoading, setIsLoading] = useState(cachedOrder === null)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [error, setError] = useState('')
  const isMountedRef = useRef(true)
  const hasAutoStartedPaymentRef = useRef(false)
  const isRefreshingRef = useRef(false)
  const refreshOrderRef = useRef<(showLoading: boolean) => Promise<void>>(async () => undefined)
  const startPaymentRef = useRef<() => Promise<void>>(async () => undefined)

  refreshOrderRef.current = async (showLoading: boolean) => {
    if (orderId === null) {
      setOrder(null)
      setError('Nieprawidłowy identyfikator zamówienia')
      setIsLoading(false)
      return
    }

    if (isRefreshingRef.current) {
      return
    }

    isRefreshingRef.current = true

    try {
      setError('')
      if (showLoading) {
        setIsLoading(true)
      }

      const result = await getOrderUseCase(orderId)
      let nextOrder = result

      if (result.payment) {
        const payment = await getPaymentStatusUseCase(orderId)
        nextOrder = mergeOrderPayment(result, payment)
      }

      if (!isMountedRef.current) {
        return
      }

      upsertOrder(nextOrder)
      setOrder(nextOrder)
    } catch (caughtError) {
      if (!isMountedRef.current) {
        return
      }

      setOrder(null)
      setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się pobrać szczegółów zamówienia')
    } finally {
      isRefreshingRef.current = false

      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  startPaymentRef.current = async () => {
    if (orderId === null) {
      return
    }

    try {
      setError('')
      setIsPaymentLoading(true)

      const payment = await createPaymentUseCase(orderId)

      if (!isMountedRef.current) {
        return
      }

      setOrder((currentOrder) => {
        if (!currentOrder) {
          return currentOrder
        }

        const nextOrder = mergeOrderPayment(currentOrder, payment)
        upsertOrder(nextOrder)
        return nextOrder
      })

      await openPaymentUrlUseCase(payment.url)
    } catch (caughtError) {
      if (!isMountedRef.current) {
        return
      }

      setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się rozpocząć płatności')
    } finally {
      if (isMountedRef.current) {
        setIsPaymentLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!canRender) {
      return
    }

    if (orderId === null) {
      setOrder(null)
      setError('Nieprawidłowy identyfikator zamówienia')
      setIsLoading(false)
      return
    }

    setOrder(cachedOrder)
    setIsLoading(cachedOrder === null)
  }, [cachedOrder, canRender, orderId])

  useEffect(() => {
    hasAutoStartedPaymentRef.current = false
  }, [orderId, shouldAutoStartPayment])

  useEffect(() => {
    if (!canRender || orderId === null) {
      return
    }

    isMountedRef.current = true
    void refreshOrderRef.current(cachedOrder === null || didReturnFromPayment)

    return () => {
      isMountedRef.current = false
    }
  }, [canRender, didReturnFromPayment, orderId])

  useFocusEffect(
    useCallback(() => {
      if (!canRender || orderId === null) {
        return undefined
      }

      const appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          void refreshOrderRef.current(false)
        }
      })

      if (Platform.OS !== 'web' || typeof window === 'undefined') {
        return () => {
          appStateSubscription.remove()
        }
      }

      const handleFocus = () => {
        void refreshOrderRef.current(false)
      }

      const handleMessage = (event: MessageEvent) => {
        if (typeof event.data !== 'object' || event.data === null) {
          return
        }

        if ((event.data as { type?: string }).type === 'payment-return') {
          void refreshOrderRef.current(false)
        }
      }

      window.addEventListener('focus', handleFocus)
      window.addEventListener('message', handleMessage)

      return () => {
        appStateSubscription.remove()
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('message', handleMessage)
      }
    }, [canRender, orderId]),
  )

  useEffect(() => {
    if (!shouldAutoStartPayment || hasAutoStartedPaymentRef.current || !order || isLoading || isPaymentLoading) {
      return
    }

    if (isPaymentConfirmed(order.payment?.status)) {
      hasAutoStartedPaymentRef.current = true
      return
    }

    hasAutoStartedPaymentRef.current = true
    void startPaymentRef.current()
  }, [isLoading, isPaymentLoading, order?.id, order?.payment?.status, shouldAutoStartPayment])

  if (!canRender) {
    return null
  }

  const paymentStatus = order?.payment?.status
  const paymentActionLabel = getPaymentActionLabel(paymentStatus)
  const showPaymentRefresh = shouldShowPaymentRefresh(paymentStatus)
  const showPaymentSection = paymentActionLabel !== null || showPaymentRefresh
  const isPhone = viewportWidth <= 520
  const mobileBottomRailInset = isPhone ? 88 : 0

  return (
    <PageWrapper>
      <Header />
      <ScrollView style={{ flex: 1, marginBottom: mobileBottomRailInset }}>
        <PageContent style={{ maxWidth: 1120 }}>
          <BackLinkButton onPress={() => router.push('/orders')}>
            <Text color="$stitchPrimary" fontSize="$4" fontWeight="700">Powrót do historii zamówień</Text>
          </BackLinkButton>

          <SectionHeading style={{ maxWidth: 760 }}>
            <Eyebrow>Zamówienie</Eyebrow>
            <SectionTitle>{order ? `Szczegóły #${order.id}` : 'Szczegóły zamówienia'}</SectionTitle>
            <SectionDescription>
              Zobacz pozycje w zamówieniu, datę złożenia oraz sumę końcową.
            </SectionDescription>
          </SectionHeading>

          {isLoading ? (
            <StateMessageCard icon="…" message="Ładowanie szczegółów zamówienia" />
          ) : error || !order ? (
            <StateMessageCard icon="!" message={error || 'Nie znaleziono zamówienia'} tone="danger" />
          ) : (
            <YStack gap="$4">
              <SurfaceCard style={{ padding: 0, overflow: 'hidden' }}>
                <YStack>
                  <CardHeaderStrip>
                    <XStack
                      gap="$3"
                      justifyContent="space-between"
                      alignItems={isPhone ? 'flex-start' : 'center'}
                      flexDirection={isPhone ? 'column' : 'row'}
                    >
                      <YStack gap="$1.5" style={{ minWidth: 0, flex: 1 }}>
                        <InfoTileLabel>
                        Zamówienie
                        </InfoTileLabel>
                        <Text color="$color" fontFamily="$heading" fontSize={isPhone ? '$6' : '$7'} fontWeight="700">
                        #{order.id}
                        </Text>
                        <InfoTileMeta>
                        {formatDateTime(order.orderDate)}
                        </InfoTileMeta>
                      </YStack>

                      <MetricTile
                        alignItems={isPhone ? 'flex-start' : 'flex-end'}
                        style={{
                          minWidth: isPhone ? 0 : 190,
                          width: isPhone ? '100%' : undefined,
                          paddingVertical: 12,
                        }}
                      >
                        <InfoTileLabel>
                        Suma zamówienia
                        </InfoTileLabel>
                        <InfoTileValueAccent style={{ fontSize: isPhone ? 24 : 28, lineHeight: isPhone ? 30 : 34 }}>
                        {formatCurrency(order.totalAmount)}
                        </InfoTileValueAccent>
                      </MetricTile>
                    </XStack>
                  </CardHeaderStrip>

                  <XStack
                    gap="$3"
                    flexWrap={isPhone ? 'nowrap' : 'wrap'}
                    flexDirection={isPhone ? 'column' : 'row'}
                    p="$3.5"
                  >
                    <InfoTile style={{ width: isPhone ? '100%' : undefined, flexBasis: isPhone ? 'auto' : 200 }}>
                      <InfoTileLabel>
                        Numer zamówienia
                      </InfoTileLabel>
                      <InfoTileValue>
                        #{order.id}
                      </InfoTileValue>
                    </InfoTile>

                    <MetricTile gap="$2.5" style={{ width: isPhone ? '100%' : undefined, flexBasis: isPhone ? 'auto' : 260 }}>
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
                </YStack>
              </SurfaceCard>

              {showPaymentSection ? (
                <SurfaceCard style={{ padding: 0, overflow: 'hidden' }}>
                  <YStack>
                    <CardHeaderStrip>
                      <Text fontSize="$5" fontWeight="800" color="$color">Obsługa płatności</Text>
                      <InfoTileMeta>
                        Rozpocznij płatność lub odśwież status, jeśli wróciłeś z operatora.
                      </InfoTileMeta>
                    </CardHeaderStrip>

                    <YStack p="$3.5">
                      <ActionButtonRow
                        style={{
                          justifyContent: isPhone ? 'stretch' : 'center',
                          alignItems: isPhone ? 'stretch' : 'center',
                          flexDirection: isPhone ? 'column' : 'row',
                          width: '100%',
                        }}
                      >
                      {paymentActionLabel ? (
                        <PrimaryButton
                          disabled={isPaymentLoading}
                          onPress={() => { void startPaymentRef.current() }}
                          style={{ minHeight: 56, width: isPhone ? '100%' : undefined }}
                        >
                          {isPaymentLoading ? 'Przekierowanie...' : paymentActionLabel}
                        </PrimaryButton>
                      ) : null}
                      {showPaymentRefresh ? (
                        <SecondaryButton
                          disabled={isLoading}
                          onPress={() => { void refreshOrderRef.current(false) }}
                          style={{ minHeight: 56, width: isPhone ? '100%' : undefined }}
                        >
                          Odśwież status
                        </SecondaryButton>
                      ) : null}
                      </ActionButtonRow>
                    </YStack>
                  </YStack>
                </SurfaceCard>
              ) : null}

              {order.items.map((item) => (
                <SurfaceCard key={item.id} style={{ padding: 0, overflow: 'hidden' }}>
                  <YStack>
                    <XStack
                      gap="$3"
                      px="$4"
                      py="$4"
                      justifyContent="space-between"
                      alignItems={isPhone ? 'flex-start' : 'center'}
                      flexDirection={isPhone ? 'column' : 'row'}
                    >
                      <YStack gap="$1.5" style={{ minWidth: 0, flex: 1 }}>
                        <Text fontSize="$5" fontWeight="700" color="$color">{item.product.name}</Text>
                        <InfoTileMeta>{item.product.description}</InfoTileMeta>
                      </YStack>

                      <MetricTile
                        alignItems={isPhone ? 'flex-start' : 'flex-end'}
                        style={{
                          minWidth: isPhone ? 0 : 170,
                          width: isPhone ? '100%' : undefined,
                          paddingVertical: 12,
                        }}
                      >
                        <InfoTileLabel>
                          Wartość pozycji
                        </InfoTileLabel>
                        <ProductPrice color="$stitchPrimary">{formatCurrency(item.unitPrice * item.quantity)}</ProductPrice>
                      </MetricTile>
                    </XStack>

                    <XStack
                      gap="$3"
                      flexWrap={isPhone ? 'nowrap' : 'wrap'}
                      flexDirection={isPhone ? 'column' : 'row'}
                      px="$4"
                      pb="$4"
                    >
                      <InfoTile style={{ width: isPhone ? '100%' : undefined, flexBasis: isPhone ? 'auto' : 180 }}>
                        <InfoTileLabel>
                          Ilość
                        </InfoTileLabel>
                        <InfoTileValue>{item.quantity}</InfoTileValue>
                      </InfoTile>

                      <InfoTile style={{ width: isPhone ? '100%' : undefined, flexBasis: isPhone ? 'auto' : 200 }}>
                        <InfoTileLabel>
                          Cena jednostkowa
                        </InfoTileLabel>
                        <InfoTileValue>{formatCurrency(item.unitPrice)}</InfoTileValue>
                      </InfoTile>
                    </XStack>
                  </YStack>
                </SurfaceCard>
              ))}

              <SurfaceCard style={{ padding: 0, overflow: 'hidden' }}>
                <CardHeaderStrip>
                  <XStack
                    justifyContent="space-between"
                    alignItems={isPhone ? 'flex-start' : 'center'}
                    flexDirection={isPhone ? 'column' : 'row'}
                    gap="$2"
                  >
                    <YStack gap="$1">
                      <Text fontSize="$6" fontWeight="800" color="$color">Suma zamówienia</Text>
                      <InfoTileMeta>Łączna wartość wszystkich pozycji w zamówieniu.</InfoTileMeta>
                    </YStack>
                    <ProductPrice color="$stitchPrimary">{formatCurrency(order.totalAmount)}</ProductPrice>
                  </XStack>
                </CardHeaderStrip>
              </SurfaceCard>
            </YStack>
          )}
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}