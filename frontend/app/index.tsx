import React from 'react'
import { XStack, YStack, Text, ScrollView, useMedia } from 'tamagui'
import { Header } from '../src/components/Header'
import { useCartStore } from '../src/store/cartStore'
import {
  PageWrapper,
  ProductGrid,
  CategoryBadge,
  HeroContainer,
  HeroTitle,
  HeroSubtitle,
  ProductCard,
  ProductInfo,
  ProductPrice,
  ProductTitle,
  ProductVisual,
  AddToCartButton,
  Eyebrow,
  Section,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  MetricCard,
  MetricLabel,
  MetricValue,
  PrimaryButton,
} from '../src/components/styled'

const PRODUCTS = [
  { id: '1', name: 'Buty sportowe Nike Air Max', price: 299.99, emoji: '👟', bg: '#EFF6FF', category: 'Obuwie' },
  { id: '2', name: 'Kurtka zimowa Premium', price: 449.99, emoji: '🧥', bg: '#FAF5FF', category: 'Odzież' },
  { id: '3', name: 'Słuchawki Sony WH-1000XM5', price: 799.99, emoji: '🎧', bg: '#FFF7ED', category: 'Elektronika' },
  { id: '4', name: 'Smartwatch Garmin Forerunner', price: 1299.99, emoji: '⌚', bg: '#F0FDF4', category: 'Elektronika' },
  { id: '5', name: 'Plecak turystyczny 40L', price: 199.99, emoji: '🎒', bg: '#FFFBEB', category: 'Akcesoria' },
  { id: '6', name: 'Opaska fitness Mi Band 8', price: 149.99, emoji: '💪', bg: '#FFF1F2', category: 'Sport' },
]

export default function Index() {
  const media = useMedia()
  const addItem = useCartStore(s => s.addItem)
  const totalValue = PRODUCTS.reduce((sum, product) => sum + product.price, 0)
  const isCompact = media.sm

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <ProductGrid>

          <Section>
            <SectionHeading>
              <Eyebrow>Katalog</Eyebrow>
              <SectionTitle>Odkryj nasze produkty</SectionTitle>
            </SectionHeading>

            <XStack flexWrap="wrap" gap="$4" style={{ justifyContent: 'space-between' }}>
            {PRODUCTS.map(product => (
              <YStack key={product.id} width="47%" $sm={{ width: '100%' }} style={{ minWidth: isCompact ? 0 : 280, flexGrow: 1 }}>
                <ProductCard>
                  <ProductVisual background={product.bg}>
                    <Text fontSize={70}>{product.emoji}</Text>
                  </ProductVisual>
                  <ProductInfo>
                    <XStack>
                      <CategoryBadge>
                        <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.5}>
                          {product.category.toUpperCase()}
                        </Text>
                      </CategoryBadge>
                    </XStack>
                    <ProductTitle numberOfLines={2}>{product.name}</ProductTitle>
                    <Text color="$placeholderColor" fontSize="$3">
                      Starannie dobrany produkt z naszej nowej, uporządkowanej kolekcji.
                    </Text>
                    <XStack mt="$1" gap="$3" style={{ justifyContent: 'space-between', alignItems: isCompact ? 'flex-start' : 'center', flexDirection: isCompact ? 'column' : 'row' }}>
                      <ProductPrice>{product.price.toFixed(2)} zł</ProductPrice>
                      <AddToCartButton size="$3" onPress={() => addItem(product)}>
                        Dodaj
                      </AddToCartButton>
                    </XStack>
                  </ProductInfo>
                </ProductCard>
              </YStack>
            ))}
            </XStack>
          </Section>
        </ProductGrid>
      </ScrollView>
    </PageWrapper>
  )
}
