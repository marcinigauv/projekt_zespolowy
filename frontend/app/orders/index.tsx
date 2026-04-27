import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { ScrollView, Text, YStack } from 'tamagui'
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
  const { canRender, isAuthenticated } = useRouteAccess()
  const cachedOrders = useOrdersStore((state) => state.orders)
  const [isLoading, setIsLoading] = useState(cachedOrders.length === 0)
  const [error, setError] = useState('')

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
        <PageContent>
          <SectionHeading>
            <Eyebrow>Zamówienia</Eyebrow>
            <SectionTitle>Historia zamówień</SectionTitle>
            <SectionDescription>
              Sprawdź listę swoich zamówień i przejdź do szczegółów konkretnej pozycji.
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
                <SurfaceCard key={order.id}>
                  <YStack gap="$3">
                    <DataRow>
                      <Text fontSize="$5" fontWeight="800">Zamówienie #{order.id}</Text>
                      <Text color="$blue10" fontWeight="700">{formatCurrency(order.totalAmount)}</Text>
                    </DataRow>
                    <DataRow>
                      <Text color="$gray10">Data</Text>
                      <Text fontWeight="600">{formatDateTime(order.orderDate)}</Text>
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