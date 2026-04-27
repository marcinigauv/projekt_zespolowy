import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { AppState, Platform } from 'react-native'
import { ScrollView, Text, YStack } from 'tamagui'
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
  DataRow,
  Eyebrow,
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

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent>
          <BackLinkButton onPress={() => router.push('/orders')}>
            <Text color="$blue10" fontSize="$4" fontWeight="700">Powrót do historii zamówień</Text>
          </BackLinkButton>

          <SectionHeading>
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
              <SurfaceCard>
                <YStack gap="$3">
                  <DataRow>
                    <Text color="$gray10">Numer zamówienia</Text>
                    <Text fontWeight="700">#{order.id}</Text>
                  </DataRow>
                  <DataRow>
                    <Text color="$gray10">Data</Text>
                    <Text fontWeight="700">{formatDateTime(order.orderDate)}</Text>
                  </DataRow>
                  <DataRow>
                    <Text color="$gray10">Płatność</Text>
                    <StatusBadge tone={getPaymentTone(order.payment?.status)}>
                      <StatusBadgeText tone={getPaymentTone(order.payment?.status)}>
                        {getPaymentStatusLabel(order.payment?.status)}
                      </StatusBadgeText>
                    </StatusBadge>
                  </DataRow>
                </YStack>
              </SurfaceCard>

              {showPaymentSection ? (
                <SurfaceCard>
                  <YStack gap="$3">
                    <Text fontSize="$5" fontWeight="800">Obsługa płatności</Text>
                    <ActionButtonRow>
                      {paymentActionLabel ? (
                        <PrimaryButton disabled={isPaymentLoading} onPress={() => { void startPaymentRef.current() }}>
                          {isPaymentLoading ? 'Przekierowanie...' : paymentActionLabel}
                        </PrimaryButton>
                      ) : null}
                      {showPaymentRefresh ? (
                        <SecondaryButton disabled={isLoading} onPress={() => { void refreshOrderRef.current(false) }}>
                          Odśwież status
                        </SecondaryButton>
                      ) : null}
                    </ActionButtonRow>
                  </YStack>
                </SurfaceCard>
              ) : null}

              {order.items.map((item) => (
                <SurfaceCard key={item.id}>
                  <YStack gap="$3">
                    <DataRow>
                      <YStack flex={1} gap="$1.5">
                        <Text fontSize="$5" fontWeight="700">{item.product.name}</Text>
                        <Text color="$placeholderColor" fontSize="$3">{item.product.description}</Text>
                      </YStack>
                      <ProductPrice>{formatCurrency(item.unitPrice * item.quantity)}</ProductPrice>
                    </DataRow>
                    <DataRow>
                      <Text color="$gray10">Ilość</Text>
                      <Text fontWeight="700">{item.quantity}</Text>
                    </DataRow>
                    <DataRow>
                      <Text color="$gray10">Cena jednostkowa</Text>
                      <Text fontWeight="700">{formatCurrency(item.unitPrice)}</Text>
                    </DataRow>
                  </YStack>
                </SurfaceCard>
              ))}

              <SurfaceCard>
                <DataRow>
                  <Text fontSize="$6" fontWeight="800">Suma zamówienia</Text>
                  <ProductPrice>{formatCurrency(order.totalAmount)}</ProductPrice>
                </DataRow>
              </SurfaceCard>
            </YStack>
          )}
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}