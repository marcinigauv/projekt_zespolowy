import React from 'react'
import { YStack, Text, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
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
  ProductPrice,
} from '../src/components/styled'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore()

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
                      <YStack flex={1} gap="$1.5">
                        <Text fontSize="$5" fontWeight="700">{item.name}</Text>
                        <Text color="$placeholderColor" fontSize="$3">Cena bazowa: {item.price.toFixed(2)} zł</Text>
                      </YStack>
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
              <PrimaryButton>Przejdź do płatności</PrimaryButton>
              <GhostDangerButton size="$4" onPress={clearCart}>Wyczyść koszyk</GhostDangerButton>
            </YStack>
          )}
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
