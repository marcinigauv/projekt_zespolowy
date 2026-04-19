import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { AppState, Platform } from 'react-native'
import { ScrollView, Text, YStack } from 'tamagui'
import { Header } from '../../src/components/Header'
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
import { useAuthStore } from '../../src/store/authStore'
import { useOrdersStore } from '../../src/store/ordersStore'
import {
  ActionButtonRow,
  BackLinkButton,
  DataRow,
  EmptyStateCard,
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

function parseOrderId(value: string | string[] | undefined): number | null {
  if (Array.isArray(value)) {
    return parseOrderId(value[0])
  }

  if (!value) {
    return null
  }

  const parsedValue = Number(value)
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null
}

function parseFlag(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) {
    return parseFlag(value[0])
  }

  return value === '1' || value === 'true'
}

function formatCurrency(value: number): string {
  return `${value.toFixed(2)} zł`
}

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('pl-PL')
}

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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const getOrderById = useOrdersStore((state) => state.getOrderById)
  const upsertOrder = useOrdersStore((state) => state.upsertOrder)
  const orderId = parseOrderId(params.id)
  const shouldAutoStartPayment = parseFlag(params.startPayment)
  const didReturnFromPayment = parseFlag(params.paymentReturn)
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
    if (!isAuthenticated) {
      router.replace('/login')
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
  }, [cachedOrder, isAuthenticated, orderId, router])

  useEffect(() => {
    hasAutoStartedPaymentRef.current = false
  }, [orderId, shouldAutoStartPayment])

  useEffect(() => {
    if (!isAuthenticated || orderId === null) {
      return
    }

    isMountedRef.current = true
    void refreshOrderRef.current(cachedOrder === null || didReturnFromPayment)

    return () => {
      isMountedRef.current = false
    }
  }, [didReturnFromPayment, isAuthenticated, orderId])

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated || orderId === null) {
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
    }, [isAuthenticated, orderId]),
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

  if (!isAuthenticated) {
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
            <EmptyStateCard gap="$3">
              <Text fontSize="$8">…</Text>
              <Text color="$gray10" fontSize="$5">Ładowanie szczegółów zamówienia</Text>
            </EmptyStateCard>
          ) : error || !order ? (
            <EmptyStateCard gap="$3">
              <Text fontSize="$8">!</Text>
              <Text color="$red10" fontSize="$5">{error || 'Nie znaleziono zamówienia'}</Text>
            </EmptyStateCard>
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
                    <Text fontWeight="700">{formatDate(order.orderDate)}</Text>
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