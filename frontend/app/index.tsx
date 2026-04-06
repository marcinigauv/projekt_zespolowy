import React from 'react'
import { XStack, YStack, Text, Button, Card, ScrollView, H3 } from 'tamagui'
import { Header } from '../src/components/Header'
import { useCartStore } from '../src/store/cartStore'
import { PageWrapper, ProductGrid, CategoryBadge } from '../src/components/styled'

const PRODUCTS = [
  { id: '1', name: 'Buty sportowe Nike Air Max', price: 299.99, emoji: '👟', bg: '#EFF6FF', category: 'Obuwie' },
  { id: '2', name: 'Kurtka zimowa Premium', price: 449.99, emoji: '🧥', bg: '#FAF5FF', category: 'Odzież' },
  { id: '3', name: 'Słuchawki Sony WH-1000XM5', price: 799.99, emoji: '🎧', bg: '#FFF7ED', category: 'Elektronika' },
  { id: '4', name: 'Smartwatch Garmin Forerunner', price: 1299.99, emoji: '⌚', bg: '#F0FDF4', category: 'Elektronika' },
  { id: '5', name: 'Plecak turystyczny 40L', price: 199.99, emoji: '🎒', bg: '#FFFBEB', category: 'Akcesoria' },
  { id: '6', name: 'Opaska fitness Mi Band 8', price: 149.99, emoji: '💪', bg: '#FFF1F2', category: 'Sport' },
]

export default function Index() {
  const addItem = useCartStore(s => s.addItem)

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <ProductGrid>
          <YStack gap="$1" paddingTop="$2">
            <Text fontSize="$8" fontWeight="bold">Odkryj nasze produkty</Text>
            <Text color="$gray10" fontSize="$4">Wybierz spośród {PRODUCTS.length} produktów</Text>
          </YStack>
          <XStack flexWrap="wrap" gap="$3">
            {PRODUCTS.map(product => (
              <YStack key={product.id} width="47%" $sm={{ width: '100%' }} minWidth={280} flexGrow={1}>
                <Card bordered overflow="hidden" pressStyle={{ scale: 0.98, opacity: 0.95 }}>
                  <YStack height={155} ai="center" jc="center" backgroundColor={product.bg}>
                    <Text fontSize={70}>{product.emoji}</Text>
                  </YStack>
                  <YStack p="$3" gap="$2">
                    <XStack>
                      <CategoryBadge>
                        <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.5}>
                          {product.category.toUpperCase()}
                        </Text>
                      </CategoryBadge>
                    </XStack>
                    <H3 numberOfLines={2} size="$5">{product.name}</H3>
                    <XStack jc="space-between" ai="center" mt="$1">
                      <Text fontSize="$6" fontWeight="bold" color="$blue10">
                        {product.price.toFixed(2)} zł
                      </Text>
                      <Button size="$3" theme="blue" onPress={() => addItem(product)}>
                        + Koszyk
                      </Button>
                    </XStack>
                  </YStack>
                </Card>
              </YStack>
            ))}
          </XStack>
        </ProductGrid>
      </ScrollView>
    </PageWrapper>
  )
}
