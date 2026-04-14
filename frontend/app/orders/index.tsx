import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { ScrollView, Text, YStack } from 'tamagui'
import { Header } from '../../src/components/Header'
import { listOrdersUseCase, type Order } from '../../src/orders/useCases'
import { getPaymentStatusLabel, getPaymentTone } from '../../src/payments/useCases'
import { useAuthStore } from '../../src/store/authStore'
import { useOrdersStore } from '../../src/store/ordersStore'
import {
  DataRow,
  EmptyStateCard,
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

export default function OrdersScreen() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const cachedOrders = useOrdersStore((state) => state.orders)
  const [orders, setOrders] = useState<Order[]>(cachedOrders)
  const [isLoading, setIsLoading] = useState(cachedOrders.length === 0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    let isMounted = true

    const loadOrders = async () => {
      try {
        setError('')
        setIsLoading(cachedOrders.length === 0)

        const result = await listOrdersUseCase()

        if (!isMounted) {
          return
        }

        setOrders(result)
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
  }, [cachedOrders.length, isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent>
          <SectionHeading>
            <Eyebrow>Zamówienia</Eyebrow>
            <SectionTitle>Historia zamówień</SectionTitle>
            <SectionDescription>
              Sprawdź listę swoich zamówień i przejdź do szczegółów konkretnej pozycji.
            </SectionDescription>
          </SectionHeading>

          {isLoading ? (
            <EmptyStateCard gap="$3">
              <Text fontSize="$8">…</Text>
              <Text color="$gray10" fontSize="$5">Ładowanie zamówień</Text>
            </EmptyStateCard>
          ) : error ? (
            <EmptyStateCard gap="$3">
              <Text fontSize="$8">!</Text>
              <Text color="$red10" fontSize="$5">{error}</Text>
            </EmptyStateCard>
          ) : orders.length === 0 ? (
            <EmptyStateCard gap="$3">
              <Text fontSize="$8">∅</Text>
              <Text color="$gray10" fontSize="$5">Nie masz jeszcze żadnych zamówień</Text>
            </EmptyStateCard>
          ) : (
            <YStack gap="$4">
              {orders.map((order) => (
                <SurfaceCard key={order.id}>
                  <YStack gap="$3">
                    <DataRow>
                      <Text fontSize="$5" fontWeight="800">Zamówienie #{order.id}</Text>
                      <Text color="$blue10" fontWeight="700">{formatCurrency(order.totalAmount)}</Text>
                    </DataRow>
                    <DataRow>
                      <Text color="$gray10">Data</Text>
                      <Text fontWeight="600">{formatDate(order.orderDate)}</Text>
                    </DataRow>
                    <DataRow>
                      <Text color="$gray10">Liczba pozycji</Text>
                      <Text fontWeight="600">{order.items.length}</Text>
                    </DataRow>
                    <DataRow>
                      <Text color="$gray10">Płatność</Text>
                      <StatusBadge tone={getPaymentTone(order.payment?.status)}>
                        <StatusBadgeText tone={getPaymentTone(order.payment?.status)}>{getPaymentStatusLabel(order.payment?.status)}</StatusBadgeText>
                      </StatusBadge>
                    </DataRow>
                    <SecondaryButton size="$4" onPress={() => router.push(`/orders/${order.id}`)}>
                      Zobacz szczegóły
                    </SecondaryButton>
                  </YStack>
                </SurfaceCard>
              ))}
            </YStack>
          )}

          <PrimaryButton onPress={() => router.push('/profile')}>
            Wróć do profilu
          </PrimaryButton>
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}