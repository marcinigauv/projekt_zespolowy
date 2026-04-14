import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, YStack } from 'tamagui'
import { Header } from '../../src/components/Header'
import { getOrderUseCase, type Order } from '../../src/orders/useCases'
import { useAuthStore } from '../../src/store/authStore'
import { useOrdersStore } from '../../src/store/ordersStore'
import {
  BackLinkButton,
  DataRow,
  EmptyStateCard,
  Eyebrow,
  PageContent,
  PageWrapper,
  ProductPrice,
  SectionDescription,
  SectionHeading,
  SectionTitle,
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

export default function OrderDetailsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string | string[] }>()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const getOrderById = useOrdersStore((state) => state.getOrderById)
  const orderId = parseOrderId(params.id)
  const cachedOrder = orderId !== null ? getOrderById(orderId) : null
  const [order, setOrder] = useState<Order | null>(cachedOrder)
  const [isLoading, setIsLoading] = useState(cachedOrder === null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    let isMounted = true

    if (orderId === null) {
      setOrder(null)
      setError('Nieprawidłowy identyfikator zamówienia')
      setIsLoading(false)
      return () => {
        isMounted = false
      }
    }

    const loadOrder = async () => {
      try {
        setError('')
        setIsLoading(cachedOrder === null)

        const result = await getOrderUseCase(orderId)

        if (!isMounted) {
          return
        }

        setOrder(result)
      } catch (caughtError) {
        if (!isMounted) {
          return
        }

        setOrder(null)
        setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się pobrać szczegółów zamówienia')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrder()

    return () => {
      isMounted = false
    }
  }, [cachedOrder, isAuthenticated, orderId, router])

  if (!isAuthenticated) {
    return null
  }

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
                    <Text fontWeight="700">{order.payment?.status ?? 'Brak płatności'}</Text>
                  </DataRow>
                </YStack>
              </SurfaceCard>

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