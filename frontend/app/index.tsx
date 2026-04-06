import React from 'react'
import { Text, ScrollView, XStack } from 'tamagui'
import { Header } from '../src/components/Header'
import { useCartStore } from '../src/store/cartStore'
import {
  PageWrapper,
  ProductGrid,
  CategoryBadge,
  ProductList,
  ProductListItem,
  ProductCard,
  ProductInfo,
  ProductPrice,
  ProductTitle,
  ProductVisual,
  AddToCartButton,
  Eyebrow,
  Section,
  SectionHeading,
  SectionTitle,
  ProductMetaRow,
  ProductMetaText,
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
  const addItem = useCartStore(s => s.addItem)

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

            <ProductList>
              {PRODUCTS.map(product => (
              <ProductListItem key={product.id}>
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
                    <ProductMetaText>
                      Starannie dobrany produkt z naszej nowej, uporządkowanej kolekcji.
                    </ProductMetaText>
                    <ProductMetaRow>
                      <ProductPrice>{product.price.toFixed(2)} zł</ProductPrice>
                      <AddToCartButton size="$3" onPress={() => addItem(product)}>
                        Dodaj
                      </AddToCartButton>
                    </ProductMetaRow>
                  </ProductInfo>
                </ProductCard>
              </ProductListItem>
            ))}
            </ProductList>
          </Section>
        </ProductGrid>
      </ScrollView>
    </PageWrapper>
  )
}
