import React, { useEffect, useState } from 'react'
import { Image, Platform, Pressable, useWindowDimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { Header } from '../../components/Header'
import { StateMessageCard } from '../../components/StateMessageCard'
import { formatCurrency } from '../../lib/formatters'
import { parsePositiveIntParam } from '../../lib/routeParams'
import { useScreenNotificationsPolling } from '../../notifications/useHomeScreenNotificationsPolling'
import {
  getProductUseCase,
  getSimilarProductsUseCase,
  type Product,
} from '../useCases'
import { useCartStore } from '../../store/cartStore'
import {
  AddToCartButton,
  BackLinkButton,
  BadgeRow,
  CategoryBadge,
  Eyebrow,
  PageWrapper,
  ProductHeroMedia,
  ProductImagePlaceholder,
  ProductMetaText,
  ProductGrid,
  Section,
  SectionHeading,
  SectionTitle,
  SecondaryButton,
  SurfaceCard,
} from '../../components/styled'
import { SimilarProductsCarousel } from './SimilarProductsCarousel'

function ProductHeroImage({ product }: { product: Product }) {
  if (product.imageUrl) {
    if (Platform.OS === 'web') {
      return (
        <img
          src={product.imageUrl}
          alt={product.name}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )
    }

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
      <Text fontFamily="$heading" fontWeight="700" color="$blue10" fontSize="$9" lineHeight="$9">
        {product.name.slice(0, 1).toUpperCase()}
      </Text>
    </ProductImagePlaceholder>
  )
}

export function ProductDetailsScreen() {
  const router = useRouter()
  const { width: viewportWidth } = useWindowDimensions()
  const isPhone = viewportWidth <= 520
  const isNarrowPhone = viewportWidth <= 390
  const isTabletRange = viewportWidth > 520 && viewportWidth <= 1024
  const ctaMinHeight = isNarrowPhone ? 52 : isPhone ? 50 : 48
  const params = useLocalSearchParams<{ id?: string | string[] }>()
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  useScreenNotificationsPolling()
  const productId = parsePositiveIntParam(params.id)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [productError, setProductError] = useState('')
  const [isProductLoading, setIsProductLoading] = useState(true)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [similarError, setSimilarError] = useState('')
  const [isSimilarLoading, setIsSimilarLoading] = useState(true)

  const quantityInCart = product ? cartItems.find((item) => item.id === product.id)?.quantity ?? 0 : 0
  const addToCartLabel = quantityInCart > 0 ? `Dodaj do koszyka (masz już ${quantityInCart})` : 'Dodaj do koszyka'
  const shouldCollapseDescription = Boolean(product && isPhone && product.description.trim().length > 140)
  const descriptionPreviewLines = isNarrowPhone ? 3 : 4
  const normalizedCategories = product?.categories
    .map((category) => category.trim())
    .filter((category) => category.length > 0) ?? []

  const handleTagPress = (tag: string) => {
    const normalizedTag = tag.trim()
    if (!normalizedTag) {
      return
    }

    router.push({
      pathname: '/',
      params: { search: normalizedTag },
    })
  }

  useEffect(() => {
    let isMounted = true
    if (productId === null) {
      setProduct(null)
      setProductError('Nieprawidłowy identyfikator produktu')
      setIsProductLoading(false)
      return () => { isMounted = false }
    }

    const loadProduct = async () => {
      try {
        setProductError('')
        setIsProductLoading(true)
        const result = await getProductUseCase({ id: productId })
        if (!isMounted) return
        setProduct(result)
      } catch (error) {
        if (!isMounted) return
        setProduct(null)
        setProductError(error instanceof Error ? error.message : 'Nie udało się pobrać produktu')
      } finally {
        if (isMounted) setIsProductLoading(false)
      }
    }
    void loadProduct()
    return () => { isMounted = false }
  }, [productId])

  useEffect(() => {
    setIsDescriptionExpanded(false)
  }, [product?.id])

  useEffect(() => {
    let isMounted = true
    if (productId === null) {
      setSimilarProducts([])
      setSimilarError('Nie można pobrać podobnych produktów dla nieprawidłowego identyfikatora')
      setIsSimilarLoading(false)
      return () => { isMounted = false }
    }

    const loadSimilarProducts = async () => {
      try {
        setSimilarError('')
        setIsSimilarLoading(true)
        const result = await getSimilarProductsUseCase({ id: productId })
        if (!isMounted) return
        setSimilarProducts(result)
      } catch (error) {
        if (!isMounted) return
        setSimilarProducts([])
        setSimilarError(error instanceof Error ? error.message : 'Nie udało się pobrać podobnych produktów')
      } finally {
        if (isMounted) setIsSimilarLoading(false)
      }
    }
    void loadSimilarProducts()
    return () => { isMounted = false }
  }, [productId])

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <ProductGrid style={{ maxWidth: 1280 }}>
          <Section>
            <BackLinkButton onPress={() => router.push('/')}>
              <Text color="$blue10" fontSize="$4" fontWeight="700">Powrót do katalogu</Text>
            </BackLinkButton>

            {isProductLoading ? (
              <StateMessageCard icon="…" message="Ładowanie produktu" />
            ) : productError || !product ? (
              <StateMessageCard icon="!" message={productError || 'Nie znaleziono produktu'} tone="danger" />
            ) : (
              <SurfaceCard gap={isNarrowPhone ? '$3' : isTabletRange ? '$4' : '$3.5'} style={{ width: '100%' }}>
                <XStack
                  gap={isNarrowPhone ? '$3' : '$4'}
                  alignItems="stretch"
                  flexDirection={viewportWidth <= 900 ? 'column' : 'row'}
                  style={{ width: '100%', minWidth: 0 }}
                >
                  <YStack
                    gap="$2.5"
                    flex={viewportWidth <= 900 ? undefined : 1}
                    style={{ width: viewportWidth <= 900 ? '100%' : undefined, minWidth: 0 }}
                  >
                    {normalizedCategories.length > 0 ? (
                      <XStack flexWrap="wrap" alignItems="center" gap="$1" style={{ rowGap: 4 }}>
                        <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                          Tagi:
                        </Text>
                        {normalizedCategories.map((category, index) => (
                          <XStack key={`${product.id}-${category}-${index}`} alignItems="center" gap="$1">
                            <Pressable onPress={() => handleTagPress(category)}>
                              <Text
                                color="$blue10"
                                fontSize="$2"
                                fontWeight="700"
                                style={{ textDecorationLine: 'underline' }}
                              >
                                {category}
                              </Text>
                            </Pressable>
                            {index < normalizedCategories.length - 1 ? (
                              <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                                ,
                              </Text>
                            ) : null}
                          </XStack>
                        ))}
                      </XStack>
                    ) : null}

                    <YStack
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderRadius="$7"
                      bg="$backgroundHover"
                      overflow="hidden"
                      style={{ width: '100%' }}
                    >
                      <ProductHeroMedia
                        style={{
                          height: isNarrowPhone
                            ? 236
                            : isPhone
                              ? 272
                            : viewportWidth <= 900
                              ? 360
                              : 520,
                        }}
                      >
                        <ProductHeroImage product={product} />
                      </ProductHeroMedia>
                    </YStack>

                    {viewportWidth <= 520 ? null : (
                      <ProductMetaText>Zdjęcie poglądowe produktu</ProductMetaText>
                    )}
                  </YStack>

                  <YStack
                    gap={isNarrowPhone ? '$2.5' : '$3'}
                    style={{ width: viewportWidth <= 900 ? '100%' : 430, minWidth: 0, flexShrink: 0 }}
                  >
                    <YStack gap="$2">
                      <Eyebrow>Produkt</Eyebrow>
                      <Text
                        color="$color"
                        fontFamily="$heading"
                        fontSize={isNarrowPhone ? '$6' : isPhone ? '$7' : '$8'}
                        fontWeight="600"
                        lineHeight={isNarrowPhone ? '$6' : isPhone ? '$7' : '$8'}
                        letterSpacing={isNarrowPhone ? -0.45 : -0.6}
                        style={{ width: '100%' }}
                      >
                        {product.name}
                      </Text>
                    </YStack>

                    <BadgeRow>
                      <CategoryBadge>
                        <Text fontSize="$1" color="$gray11" fontWeight="700" letterSpacing={0.5}>
                          DOSTĘPNE: {product.amount}
                        </Text>
                      </CategoryBadge>
                    </BadgeRow>

                    <SurfaceCard style={{ padding: isNarrowPhone ? 12 : isPhone ? 14 : 16 }}>
                      <YStack gap="$2">
                        <ProductMetaText>Cena</ProductMetaText>
                        <Text
                          color="$color"
                          fontFamily="$heading"
                          fontSize={isNarrowPhone ? '$7' : isPhone ? '$8' : '$9'}
                          fontWeight="700"
                          lineHeight={isNarrowPhone ? '$7' : isPhone ? '$8' : '$9'}
                        >
                          {formatCurrency(product.price)}
                        </Text>
                        <ProductMetaText>
                          {product.amount > 0
                            ? `Dostępnych sztuk: ${product.amount}`
                            : 'Produkt obecnie niedostępny'}
                        </ProductMetaText>
                      </YStack>
                    </SurfaceCard>

                    <SurfaceCard style={{ padding: isNarrowPhone ? 12 : isPhone ? 14 : 18 }}>
                      <YStack gap="$2">
                        <Text fontSize="$5" fontWeight="800" color="$color">Opis</Text>
                        <Text
                          color="$gray11"
                          fontSize={isNarrowPhone ? '$2' : isPhone ? '$3' : '$4'}
                          lineHeight={isNarrowPhone ? '$3' : isPhone ? '$4' : '$5'}
                          numberOfLines={shouldCollapseDescription && !isDescriptionExpanded ? descriptionPreviewLines : undefined}
                        >
                          {product.description}
                        </Text>
                        {shouldCollapseDescription ? (
                          <Pressable onPress={() => setIsDescriptionExpanded((current) => !current)}>
                            <Text color="$blue10" fontSize="$2" fontWeight="700">
                              {isDescriptionExpanded ? 'Pokaż mniej' : 'Pokaż więcej'}
                            </Text>
                          </Pressable>
                        ) : null}
                      </YStack>
                    </SurfaceCard>

                    <YStack gap={isNarrowPhone ? '$2' : '$2.5'} style={{ width: '100%' }}>
                      <AddToCartButton
                        size="$4"
                        width="100%"
                        disabled={product.amount <= 0}
                        style={{
                          minHeight: ctaMinHeight,
                          justifyContent: 'center',
                          opacity: product.amount <= 0 ? 0.62 : 1,
                        }}
                        onPress={() =>
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                          })
                        }
                      >
                        {product.amount > 0 ? addToCartLabel : 'Brak w magazynie'}
                      </AddToCartButton>

                      <SecondaryButton
                        size="$4"
                        width="100%"
                        style={{ minHeight: ctaMinHeight, justifyContent: 'center' }}
                        onPress={() => router.push('/cart')}
                      >
                        Przejdź do koszyka
                      </SecondaryButton>
                    </YStack>
                  </YStack>
                </XStack>
              </SurfaceCard>
            )}

            <Section>
              <SectionHeading>
                <Eyebrow>Inspiracje</Eyebrow> 
              </SectionHeading>
              <SimilarProductsCarousel
                products={similarProducts}
                isLoading={isSimilarLoading}
                error={similarError}
              />
            </Section>
          </Section>
        </ProductGrid>
      </ScrollView>
    </PageWrapper>
  )
}