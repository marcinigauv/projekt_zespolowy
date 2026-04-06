import React from 'react'
import { YStack, XStack, Text, Button, Card, H2, ScrollView, Separator } from 'tamagui'
import { Header } from '../src/components/Header'
import { useCartStore } from '../src/store/cartStore'
import { PageWrapper, PageContent } from '../src/components/styled'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore()

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent>
          <H2>Koszyk ({getTotalItems()})</H2>
          {items.length === 0 ? (
            <YStack ai="center" py="$10" gap="$3">
              <Text fontSize="$8">🛒</Text>
              <Text color="$gray10" fontSize="$5">Koszyk jest pusty</Text>
            </YStack>
          ) : (
            <YStack gap="$3">
              {items.map(item => (
                <Card key={item.id} bordered elevate>
                  <Card.Header padded>
                    <YStack gap="$3">
                      <XStack jc="space-between" ai="center">
                        <Text fontSize="$5" fontWeight="bold">{item.name}</Text>
                        <Button size="$2" chromeless color="$red10" onPress={() => removeItem(item.id)}>Usuń</Button>
                      </XStack>
                      <XStack jc="space-between" ai="center">
                        <XStack gap="$2" ai="center">
                          <Button size="$3" circular onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</Button>
                          <Text fontSize="$5" minWidth={24} textAlign="center">{item.quantity}</Text>
                          <Button size="$3" circular onPress={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                        </XStack>
                        <Text fontSize="$5" fontWeight="bold" color="$blue10">
                          {(item.price * item.quantity).toFixed(2)} zł
                        </Text>
                      </XStack>
                    </YStack>
                  </Card.Header>
                </Card>
              ))}
              <Card bordered elevate>
                <Card.Header padded>
                  <XStack jc="space-between" ai="center">
                    <Text fontSize="$6" fontWeight="bold">Suma</Text>
                    <Text fontSize="$7" fontWeight="bold" color="$blue10">{getTotalPrice().toFixed(2)} zł</Text>
                  </XStack>
                </Card.Header>
              </Card>
              <Button size="$5" theme="blue">Przejdź do płatności</Button>
              <Button size="$4" chromeless color="$red10" onPress={clearCart}>Wyczyść koszyk</Button>
            </YStack>
          )}
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
