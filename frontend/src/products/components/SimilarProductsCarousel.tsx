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
  const isMobile = !media.gtSm

  useEffect(() => {
    setActiveIndex(0)
  }, [products])

  if (isLoading) {
    return <StateMessageCard icon="…" message="Ładowanie podobnych produktów" />
  }

  if (error) {
    return <StateMessageCard icon="!" message={error} tone="danger" />
  }

  if (products.length === 0) {
    return <StateMessageCard icon="∅" message="Brak podobnych produktów" />
  }

  const total = products.length

  let startIndex = activeIndex
  if (!isMobile && total >= 2) {
    if (activeIndex >= total - 1) {
      startIndex = total - 2
    }
  } else if (!isMobile && total === 2) {
    if (activeIndex >= total - 1) {
      startIndex = total - 2
    }
  }

  const displayedProducts = []
  if (total > 0) {
    displayedProducts.push(products[startIndex])
    if (!isMobile && startIndex + 1 < total) {
      displayedProducts.push(products[startIndex + 1])
    }    
  }

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
          {activeIndex > 0 && (
            <SecondaryButton size="$3" onPress={() => setActiveIndex((current) => current - 1)}>
              Poprzedni
            </SecondaryButton>
          )}
          
          <Text color="$placeholderColor" fontSize="$3">
            {activeIndex + 1} / {total}
          </Text>
          
          {activeIndex < total - 1 && (
            <SecondaryButton size="$3" onPress={() => setActiveIndex((current) => current + 1)}>
              Następny
            </SecondaryButton>
          )}
        </CarouselControls>
      </DataRow>

      <XStack gap="$3" width="100%" py="$2">
        {displayedProducts.map((item) => {
          const isActive = item.id === products[activeIndex].id

          return (
            <ProductCarouselFrame 
              key={item.id} 
              flex={1}
              style={{ scale: isActive ? 1.04 : 1, zIndex: isActive ? 2 : 1 }}
            >
              <ProductCardLinkButton style={{ padding: 15 }} onPress={() => router.push(`/products/${item.id}`)}>
                <ProductCarouselMedia>
                  <ProductImage product={item} />
                </ProductCarouselMedia>

                <YStack>
                  <ProductCardSection>
                    <BadgeRow>
                      <CategoryBadge>
                        <Text fontSize="$2" color="$gray11" fontWeight="600" letterSpacing={0.5}>
                          DOSTĘPNE: {item.amount}
                        </Text>
                      </CategoryBadge>
                      {item.categories.map((category) => (
                        <CategoryBadge key={`${item.id}-${category}`}>
                          <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.5}>
                            {category}
                          </Text>
                        </CategoryBadge>
                      ))}
                    </BadgeRow>
                  </ProductCardSection>

                  <ProductCardSection>
                    <ProductTitle numberOfLines={2}>{item.name}</ProductTitle>
                  </ProductCardSection>

                  <ProductCardSection>
                    <DataRow style={{ justifyContent: "flex-end" }}>
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
            </ProductCarouselFrame>
          )
        })}
      </XStack>
    </SurfaceCard>
  )
}