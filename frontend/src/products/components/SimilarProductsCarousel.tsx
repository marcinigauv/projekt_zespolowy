import React, { useEffect, useState } from 'react'
import { Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Text, XStack, YStack } from 'tamagui'
import type { Product } from '../useCases'
import {
  BadgeRow,
  CarouselControls,
  CategoryBadge,
  DataRow,
  EmptyStateCard,
  ProductCardAddButton,
  ProductCardFooter,
  ProductCardLinkButton,
  ProductCarouselFrame,
  ProductCarouselMedia,
  ProductImagePlaceholder,
  ProductMetaText,
  ProductPrice,
  ProductTitle,
  SecondaryButton,
  SurfaceCard,
} from '../../components/styled'
import { useCartStore } from '../../store/cartStore'

interface SimilarProductsCarouselProps {
  products: Product[]
  isLoading: boolean
  error: string
}

function normalizeIndex(index: number, length: number): number {
  return ((index % length) + length) % length
}

function ProductImage({ product }: { product: Product }) {
  if (product.imageUrl) {
    return (
      <Image
        source={{ uri: product.imageUrl }}
        resizeMode="cover"
        style={{ width: '100%', height: '100%' }}
      />
    )
  }

  return (
    <ProductImagePlaceholder>
      <Text fontSize="$10" fontWeight="800" color="$blue10">
        {product.name.slice(0, 1).toUpperCase()}
      </Text>
    </ProductImagePlaceholder>
  )
}

export function SimilarProductsCarousel({ products, isLoading, error }: SimilarProductsCarouselProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [products])

  if (isLoading) {
    return (
      <EmptyStateCard gap="$3">
        <Text fontSize="$8">…</Text>
        <Text color="$gray10" fontSize="$5">Ładowanie podobnych produktów</Text>
      </EmptyStateCard>
    )
  }

  if (error) {
    return (
      <EmptyStateCard gap="$3">
        <Text fontSize="$8">!</Text>
        <Text color="$red10" fontSize="$5">{error}</Text>
      </EmptyStateCard>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyStateCard gap="$3">
        <Text fontSize="$8">∅</Text>
        <Text color="$gray10" fontSize="$5">Brak podobnych produktów</Text>
      </EmptyStateCard>
    )
  }

  const product = products[normalizeIndex(activeIndex, products.length)]

  return (
    <SurfaceCard gap="$4">
      <DataRow>
        <YStack gap="$1">
          <Text fontSize="$6" fontWeight="800">Podobne produkty</Text>
          <Text color="$placeholderColor" fontSize="$3">
            Przeglądaj propozycje dopasowane do oglądanego produktu.
          </Text>
        </YStack>
        <CarouselControls>
          <SecondaryButton size="$3" onPress={() => setActiveIndex((current) => current - 1)}>
            Poprzedni
          </SecondaryButton>
          <Text color="$placeholderColor" fontSize="$3">
            {normalizeIndex(activeIndex, products.length) + 1} / {products.length}
          </Text>
          <SecondaryButton size="$3" onPress={() => setActiveIndex((current) => current + 1)}>
            Następny
          </SecondaryButton>
        </CarouselControls>
      </DataRow>

      <ProductCarouselFrame>
        <ProductCardLinkButton onPress={() => router.push(`/products/${product.id}`)}>
          <ProductCarouselMedia>
            <ProductImage product={product} />
          </ProductCarouselMedia>

          <YStack p="$4" gap="$3">
            <BadgeRow>
              <CategoryBadge>
                <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.5}>
                  DOSTĘPNE: {product.amount}
                </Text>
              </CategoryBadge>
              {product.categories.map((category) => (
                <CategoryBadge key={`${product.id}-${category}`}>
                  <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.5}>
                    {category}
                  </Text>
                </CategoryBadge>
              ))}
            </BadgeRow>

            <ProductTitle>{product.name}</ProductTitle>
            <ProductMetaText numberOfLines={4}>{product.description}</ProductMetaText>

            <DataRow>
              <ProductPrice>{product.price.toFixed(2)} zł</ProductPrice>
              <Text color="$blue10" fontSize="$3" fontWeight="700">
                Zobacz szczegóły
              </Text>
            </DataRow>
          </YStack>
        </ProductCardLinkButton>
        <ProductCardFooter>
          <ProductCardAddButton
            size="$3"
            onPress={() =>
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
              })
            }
          >
            Dodaj
          </ProductCardAddButton>
        </ProductCardFooter>
      </ProductCarouselFrame>
    </SurfaceCard>
  )
}