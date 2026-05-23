import React, { useEffect, useState } from 'react'
import { Image, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { Text, XStack, YStack } from 'tamagui'
import { StateMessageCard } from '../../components/StateMessageCard'
import { formatCurrency } from '../../lib/formatters'
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
  const [pageIndex, setPageIndex] = useState(0)
  const { width: viewportWidth } = useWindowDimensions()
  const isPhone = viewportWidth <= 520
  const isNarrowPhone = viewportWidth <= 390
  const isTabletRange = viewportWidth > 520 && viewportWidth <= 1024

  const total = products.length
  const pageSize = isPhone ? 1 : 2
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    setPageIndex(0)
  }, [products, pageSize])

  useEffect(() => {
    setPageIndex((current) => Math.min(current, pageCount - 1))
  }, [pageCount])

  if (isLoading) {
    return <StateMessageCard icon="…" message="Ładowanie podobnych produktów" />
  }

  if (error) {
    return <StateMessageCard icon="!" message={error} tone="danger" />
  }

  if (products.length === 0) {
    return <StateMessageCard icon="∅" message="Brak podobnych produktów" />
  }

  const startIndex = pageIndex * pageSize
  const displayedProducts = products.slice(startIndex, startIndex + pageSize)
  const cardHeight = isNarrowPhone ? 356 : isPhone ? 372 : isTabletRange ? 468 : 424
  const cardMediaHeight = isNarrowPhone ? 156 : isPhone ? 166 : isTabletRange ? 214 : 186
  const descriptionLines = isTabletRange ? 3 : 2
  const controlsButtonMinWidth = isNarrowPhone ? 86 : isPhone ? 96 : 108
  const controlsLabelMinWidth = isNarrowPhone ? 44 : isPhone ? 54 : 70

  const headerControls = (
    <CarouselControls
      style={{
        width: isPhone ? '100%' : undefined,
        justifyContent: isPhone ? 'space-between' : 'flex-end',
        alignItems: 'center',
        gap: isNarrowPhone ? 6 : isPhone ? 8 : 10,
        flexShrink: 0,
      }}
    >
      <SecondaryButton
        size="$3"
        disabled={pageIndex === 0}
        onPress={() => setPageIndex((current) => Math.max(0, current - 1))}
        style={{ minWidth: controlsButtonMinWidth, opacity: pageIndex === 0 ? 0.56 : 1 }}
      >
        Poprzedni
      </SecondaryButton>

      <YStack alignItems="center" justifyContent="center" style={{ minWidth: controlsLabelMinWidth }}>
        <Text color="$placeholderColor" fontSize={isNarrowPhone ? '$2' : '$3'} fontWeight="700">
          {pageIndex + 1} / {pageCount}
        </Text>
      </YStack>

      <SecondaryButton
        size="$3"
        disabled={pageIndex >= pageCount - 1}
        onPress={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))}
        style={{ minWidth: controlsButtonMinWidth, opacity: pageIndex >= pageCount - 1 ? 0.56 : 1 }}
      >
        Następny
      </SecondaryButton>
    </CarouselControls>
  )

  return (
    <SurfaceCard gap="$4">
      {isPhone ? (
        <YStack gap="$2.5" style={{ width: '100%' }}>
          <YStack gap="$1" minWidth={0} style={{ width: '100%' }}>
            <Text
              fontSize={isNarrowPhone ? '$4' : '$5'}
              color="$color"
              fontWeight="700"
              fontFamily="$heading"
              style={{ lineHeight: isNarrowPhone ? 28 : 30 }}
            >
              Podobne produkty
            </Text>
            <Text
              color="$placeholderColor"
              fontSize={isNarrowPhone ? '$2' : '$3'}
              style={{ lineHeight: isNarrowPhone ? 18 : 20 }}
            >
              Propozycje dopasowane do oglądanego produktu.
            </Text>
          </YStack>
          {headerControls}
        </YStack>
      ) : (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$3"
          style={{ width: '100%', minHeight: isTabletRange ? 64 : 60 }}
        >
          <YStack gap="$1" flex={1} minWidth={0} style={{ paddingRight: 12 }}>
            <Text
              fontSize="$6"
              color="$color"
              fontWeight="700"
              fontFamily="$heading"
              numberOfLines={1}
            >
              Podobne produkty
            </Text>
            <Text color="$placeholderColor" fontSize="$3" numberOfLines={2}>
              Propozycje dopasowane do oglądanego produktu.
            </Text>
          </YStack>
          {headerControls}
        </XStack>
      )}

      <XStack gap="$2.5" width="100%" py="$2" alignItems="stretch">
        {displayedProducts.map((item) => {
          const visibleCategories = item.categories.slice(0, 1)
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
                  <ProductCarouselMedia style={{ height: cardMediaHeight }}>
                    <ProductImage product={item} />
                  </ProductCarouselMedia>

                  <YStack flex={1}>
                    <ProductCardSection style={{ minHeight: isPhone ? 48 : isTabletRange ? 58 : 54 }}>
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

                    <ProductCardSection
                      style={{
                        flex: 1,
                        minHeight: isPhone ? 92 : isTabletRange ? 136 : 110,
                        gap: isTabletRange ? '$2' : '$1.5',
                      }}
                    >
                      <ProductTitle numberOfLines={2}>{item.name}</ProductTitle>
                      <ProductMetaText
                        numberOfLines={descriptionLines}
                        style={{
                          color: '$gray11',
                          fontSize: isNarrowPhone ? '$2' : isTabletRange ? '$3' : '$2',
                          lineHeight: isNarrowPhone ? 18 : isTabletRange ? 22 : 20,
                        }}
                      >
                        {item.description}
                      </ProductMetaText>
                    </ProductCardSection>

                    <ProductCardSection>
                      <DataRow style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <ProductMetaText>Dostępnych: {item.amount}</ProductMetaText>
                        <ProductPrice>{formatCurrency(item.price)}</ProductPrice>
                      </DataRow>
                    </ProductCardSection>
                  </YStack>
                </ProductCardLinkButton>
                <ProductCardFooter>
                  <ProductCardAddButton
                    size="$3"
                    style={{ minHeight: isPhone ? 44 : isTabletRange ? 46 : 42 }}
                    onPress={() =>
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        imageUrl: item.imageUrl,
                      })
                    }
                  >
                    Dodaj do koszyka
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