import React from 'react'
import { useRouter } from 'expo-router'
import { Button, YStack, Text, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
import { useScreenNotificationsPolling } from '../src/notifications/useHomeScreenNotificationsPolling'
import { createOrderCommandFromCart, createOrderUseCase } from '../src/orders/useCases'
import { useAuthStore } from '../src/store/authStore'
import { useCartStore } from '../src/store/cartStore'
import {
  PageWrapper,
  PageContent,
  DataRow,
  Eyebrow,
  EmptyStateCard,
  GhostDangerButton,
  InlineControls,
  PrimaryButton,
  SecondaryButton,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  SurfaceCard,
  ProductMetaText,
  ProductPrice,
  ProductTitle,
} from '../src/components/styled'

export default function Cart() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  useScreenNotificationsPolling()
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const getTotalItems = useCartStore((state) => state.getTotalItems)

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const order = await createOrderUseCase(createOrderCommandFromCart(items))
    clearCart()
    router.replace(`/orders/${order.id}`)
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent>
          <SectionHeading>
            <Eyebrow>Koszyk</Eyebrow>
            <SectionTitle>Twoje zamówienie ({getTotalItems()})</SectionTitle>
            <SectionDescription>
              Przeglądaj swoje produkty, aktualizuj ilości lub usuwaj przedmioty z koszyka. Kiedy już się zdecydujesz, przejdź do płatności.
            </SectionDescription>
          </SectionHeading>

          {items.length === 0 ? (
            <EmptyStateCard gap="$3">
              <Text fontSize="$8">🛒</Text>
              <Text color="$gray10" fontSize="$5">Twój koszyk jest pusty</Text>
            </EmptyStateCard>
          ) : (
            <YStack gap="$4">
              {items.map(item => (
                <SurfaceCard key={item.id}>
                  <YStack gap="$3">
                    <DataRow>
                      <Button
                        chromeless
                        onPress={() => router.push(`/products/${item.id}`)}
                        pressStyle={{ opacity: 0.78 }}
                        px="$0"
                        py="$0"
                        style={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}
                      >
                        <YStack flex={1} gap="$1" style={{ minWidth: 0, alignItems: 'flex-start' }}>
                          <ProductTitle numberOfLines={2}>{item.name}</ProductTitle>
                          <ProductMetaText>Cena bazowa: {item.price.toFixed(2)} zł</ProductMetaText>
                          <Text color="$blue10" fontSize="$2" fontWeight="700">Szczegóły produktu</Text>
                        </YStack>
                      </Button>
                      <GhostDangerButton size="$2" onPress={() => removeItem(item.id)}>Usuń</GhostDangerButton>
                    </DataRow>
                    <DataRow>
                      <InlineControls>
                        <SecondaryButton size="$3" circular onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</SecondaryButton>
                        <Text fontSize="$5" style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Text>
                        <SecondaryButton size="$3" circular onPress={() => updateQuantity(item.id, item.quantity + 1)}>+</SecondaryButton>
                      </InlineControls>
                      <ProductPrice>{(item.price * item.quantity).toFixed(2)} zł</ProductPrice>
                    </DataRow>
                  </YStack>
                </SurfaceCard>
              ))}
              <SurfaceCard>
                <DataRow>
                  <Text fontSize="$6" fontWeight="800">Suma</Text>
                  <ProductPrice>{getTotalPrice().toFixed(2)} zł</ProductPrice>
                </DataRow>
              </SurfaceCard>
              <PrimaryButton onPress={() => { void handleCheckout() }}>Złóż zamówienie</PrimaryButton>
              <GhostDangerButton size="$4" onPress={clearCart}>Wyczyść koszyk</GhostDangerButton>
            </YStack>
          )}
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
