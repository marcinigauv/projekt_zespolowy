import React, { useEffect, useState } from 'react'
import { Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Text, XStack, YStack, useMedia } from 'tamagui'
import { StateMessageCard } from '../../components/StateMessageCard'
import type { Product } from '../useCases'
import {
  BadgeRow,
  CarouselControls,
  CategoryBadge,
  DataRow,
  ProductCardAddButton,
  ProductCardFooter,
  ProductCardLinkButton,
  ProductCardSection,
  ProductCarouselFrame,
  ProductCarouselMedia,
  ProductImagePlaceholder,
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
      <Text color="$blue10" fontSize="$10" fontWeight="700" fontFamily="$heading">
        {product.name.slice(0, 1).toUpperCase()}
      </Text>
    </ProductImagePlaceholder>
  )
}

export function SimilarProductsCarousel({ products, isLoading, error }: SimilarProductsCarouselProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const [activeIndex, setActiveIndex] = useState(0)

  const media = useMedia()
  const isPhone = media.xs
  const total = products.length
  const visibleCount = isPhone ? 1 : 2
  const maxStartIndex = Math.max(0, total - visibleCount)

  useEffect(() => {
    setActiveIndex(0)
  }, [products])

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxStartIndex))
  }, [maxStartIndex])

  if (isLoading) {
    return <StateMessageCard icon="…" message="Ładowanie podobnych produktów" />
  }

  if (error) {
    return <StateMessageCard icon="!" message={error} tone="danger" />
  }

  if (products.length === 0) {
    return <StateMessageCard icon="∅" message="Brak podobnych produktów" />
  }

  const startIndex = Math.min(activeIndex, maxStartIndex)
  const displayedProducts = products.slice(startIndex, startIndex + visibleCount)
  const cardHeight = isPhone ? 336 : 360

  return (
    <SurfaceCard gap="$4">
      <DataRow>
        <YStack gap="$1">
          <Text fontSize="$6" color="$color" fontWeight="700" fontFamily="$heading">Podobne produkty</Text>
          <Text color="$placeholderColor" fontSize="$3">
           Propozycje dopasowane do oglądanego produktu.
          </Text>
        </YStack>
        <CarouselControls>
          {startIndex > 0 && (
            <SecondaryButton size="$3" onPress={() => setActiveIndex((current) => Math.max(0, current - 1))}>
              Poprzedni
            </SecondaryButton>
          )}

          <Text color="$placeholderColor" fontSize="$3">
            {startIndex + 1} / {total}
          </Text>

          {startIndex < maxStartIndex && (
            <SecondaryButton size="$3" onPress={() => setActiveIndex((current) => Math.min(maxStartIndex, current + 1))}>
              Następny
            </SecondaryButton>
          )}
        </CarouselControls>
      </DataRow>

      <XStack gap="$2.5" width="100%" py="$2" alignItems="stretch">
        {displayedProducts.map((item) => {
          const visibleCategories = item.categories.slice(0, 2)
          const remainingCategories = Math.max(0, item.categories.length - visibleCategories.length)

          return (
            <ProductCarouselFrame
              key={item.id}
              flex={1}
              minWidth={0}
              style={{ height: cardHeight }}
            >
              <YStack flex={1}>
                <ProductCardLinkButton style={{ padding: 0, flex: 1 }} onPress={() => router.push(`/products/${item.id}`)}>
                  <ProductCarouselMedia>
                    <ProductImage product={item} />
                  </ProductCarouselMedia>

                  <YStack flex={1}>
                    <ProductCardSection style={{ minHeight: isPhone ? 54 : 60 }}>
                      <BadgeRow>
                        <CategoryBadge>
                          <Text fontSize="$1" color="$gray11" fontWeight="600" letterSpacing={0.4}>
                            DOSTĘPNE: {item.amount}
                          </Text>
                        </CategoryBadge>
                        {visibleCategories.map((category) => (
                          <CategoryBadge key={`${item.id}-${category}`}>
                            <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.4}>
                              {category}
                            </Text>
                          </CategoryBadge>
                        ))}
                        {remainingCategories > 0 ? (
                          <CategoryBadge>
                            <Text fontSize="$1" color="$gray11" fontWeight="600" letterSpacing={0.4}>
                              +{remainingCategories}
                            </Text>
                          </CategoryBadge>
                        ) : null}
                      </BadgeRow>
                    </ProductCardSection>

                    <ProductCardSection style={{ flex: 1, minHeight: isPhone ? 52 : 60 }}>
                      <ProductTitle numberOfLines={2}>{item.name}</ProductTitle>
                    </ProductCardSection>

                    <ProductCardSection>
                      <DataRow style={{ justifyContent: 'flex-end' }}>
                        <ProductPrice>{item.price.toFixed(2)} zł</ProductPrice>
                      </DataRow>
                    </ProductCardSection>
                  </YStack>
                </ProductCardLinkButton>
                <ProductCardFooter>
                  <ProductCardAddButton
                    size="$3"
                    onPress={() =>
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                      })
                    }
                  >
                    Dodaj
                  </ProductCardAddButton>
                </ProductCardFooter>
              </YStack>
            </ProductCarouselFrame>
          )
        })}
      </XStack>
    </SurfaceCard>
  )
}