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
  getProductRatingAverageUseCase,
  getProductUseCase,
  getRecommendedProductsForYouUseCase,
  getSimilarProductsUseCase,
  rateProductUseCase,
  type Product,
  type ProductRatingAverage,
} from '../useCases'
import { useAuthStore } from '../../store/authStore'
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

const PRODUCT_RATING_VALUES = [1, 2, 3, 4, 5] as const

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
      <Text fontFamily="$heading" fontWeight="700" color="$stitchPrimary" fontSize="$9" lineHeight="$9">
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
  const ctaMinHeight = isPhone ? 56 : 48
  const detailsTitleFontSize = isNarrowPhone ? '$5' : isPhone ? '$6' : isTabletRange ? '$7' : '$8'
  const detailsTitleLineHeight = isNarrowPhone ? '$5' : isPhone ? '$6' : isTabletRange ? '$7' : '$8'
  const detailsPriceFontSize = isNarrowPhone ? '$6' : isPhone ? '$7' : isTabletRange ? '$7' : '$8'
  const detailsPriceLineHeight = isNarrowPhone ? '$6' : isPhone ? '$7' : isTabletRange ? '$7' : '$8'
  const params = useLocalSearchParams<{ id?: string | string[] }>()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved)
  const shouldShowRecommended = isAuthResolved && isAuthenticated
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
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [recommendedError, setRecommendedError] = useState('')
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false)
  const [ratingAverage, setRatingAverage] = useState<ProductRatingAverage | null>(null)
  const [ratingAverageError, setRatingAverageError] = useState('')
  const [isRatingAverageLoading, setIsRatingAverageLoading] = useState(true)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [ratingSubmitError, setRatingSubmitError] = useState('')
  const [ratingSubmitSuccess, setRatingSubmitSuccess] = useState('')
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false)

  const quantityInCart = product ? cartItems.find((item) => item.id === product.id)?.quantity ?? 0 : 0
  const addToCartLabel = quantityInCart > 0 ? `Dodaj do koszyka (masz już ${quantityInCart})` : 'Dodaj do koszyka'
  const shouldCollapseDescription = Boolean(product && isPhone && product.description.trim().length > 140)
  const descriptionPreviewLines = isNarrowPhone ? 3 : 4
  const normalizedCategories = product?.categories
    .map((category) => category.trim())
    .filter((category) => category.length > 0) ?? []

  const averageRatingLabel =
    ratingAverage?.averageRating === null || ratingAverage === null
      ? 'Brak ocen'
      : `${ratingAverage.averageRating.toFixed(1)} / 5`

  const ratingsCountLabel = ratingAverage ? `${ratingAverage.ratingsCount}` : '0'

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

  useEffect(() => {
    let isMounted = true

    if (!shouldShowRecommended) {
      setRecommendedProducts([])
      setRecommendedError('')
      setIsRecommendedLoading(false)
      return () => { isMounted = false }
    }

    if (productId === null) {
      setRecommendedProducts([])
      setRecommendedError('Nie można pobrać rekomendacji dla nieprawidłowego identyfikatora')
      setIsRecommendedLoading(false)
      return () => { isMounted = false }
    }

    const loadRecommendedProducts = async () => {
      try {
        setRecommendedError('')
        setIsRecommendedLoading(true)
        const result = await getRecommendedProductsForYouUseCase({ id: productId })
        if (!isMounted) return
        setRecommendedProducts(result)
      } catch (error) {
        if (!isMounted) return
        setRecommendedProducts([])
        setRecommendedError(error instanceof Error ? error.message : 'Nie udało się pobrać rekomendacji')
      } finally {
        if (isMounted) setIsRecommendedLoading(false)
      }
    }

    void loadRecommendedProducts()
    return () => { isMounted = false }
  }, [productId, shouldShowRecommended])

  useEffect(() => {
    let isMounted = true

    if (productId === null) {
      setRatingAverage(null)
      setRatingAverageError('Nie można pobrać średniej oceny dla nieprawidłowego identyfikatora')
      setIsRatingAverageLoading(false)
      return () => { isMounted = false }
    }

    const loadRatingAverage = async () => {
      try {
        setRatingAverageError('')
        setIsRatingAverageLoading(true)
        const result = await getProductRatingAverageUseCase({ id: productId })
        if (!isMounted) return
        setRatingAverage(result)
      } catch (error) {
        if (!isMounted) return
        setRatingAverage(null)
        setRatingAverageError(error instanceof Error ? error.message : 'Nie udało się pobrać średniej oceny')
      } finally {
        if (isMounted) setIsRatingAverageLoading(false)
      }
    }

    void loadRatingAverage()
    return () => { isMounted = false }
  }, [productId])

  useEffect(() => {
    setUserRating(null)
    setRatingSubmitError('')
    setRatingSubmitSuccess('')
  }, [productId])

  const handleRateProduct = async (rating: number) => {
    if (!isAuthenticated) {
      setRatingSubmitSuccess('')
      setRatingSubmitError('Zaloguj się, aby ocenić produkt')
      return
    }

    if (productId === null) {
      setRatingSubmitSuccess('')
      setRatingSubmitError('Nieprawidłowy identyfikator produktu')
      return
    }

    try {
      setIsRatingSubmitting(true)
      setRatingSubmitError('')
      setRatingSubmitSuccess('')

      const result = await rateProductUseCase({ id: productId, rating })
      setUserRating(result.rating)
      setRatingSubmitSuccess('Ocena została zapisana')

      const averageResult = await getProductRatingAverageUseCase({ id: productId })
      setRatingAverage(averageResult)
    } catch (error) {
      setRatingSubmitSuccess('')
      setRatingSubmitError(error instanceof Error ? error.message : 'Nie udało się zapisać oceny')
    } finally {
      setIsRatingSubmitting(false)
    }
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <ProductGrid style={{ maxWidth: 1280 }}>
          <Section>
            <BackLinkButton onPress={() => router.push('/')}>
              <Text color="$stitchPrimary" fontSize="$4" fontWeight="700">Powrót do katalogu</Text>
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
                      <BadgeRow alignItems="center">
                        <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
                          Tagi:
                        </Text>
                        {normalizedCategories.map((category, index) => (
                          <Pressable
                            key={`${product.id}-${category}-${index}`}
                            onPress={() => handleTagPress(category)}
                            style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
                          >
                            <CategoryBadge>
                              <Text color="$stitchPrimary" fontFamily="$mono" fontSize="$1" fontWeight="600" letterSpacing={0.4}>
                                {category}
                              </Text>
                            </CategoryBadge>
                          </Pressable>
                        ))}
                      </BadgeRow>
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
                        fontSize={detailsTitleFontSize}
                        fontWeight="600"
                        lineHeight={detailsTitleLineHeight}
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

                    <SurfaceCard
                      bg="$backgroundHover"
                      borderColor="$stitchBorder"
                      style={{
                        padding: isNarrowPhone ? 12 : isPhone ? 14 : 16,
                      }}
                    >
                      <YStack gap="$2">
                        <ProductMetaText>Cena</ProductMetaText>
                        <Text
                          color="$color"
                          fontFamily="$heading"
                          fontSize={detailsPriceFontSize}
                          fontWeight="700"
                          lineHeight={detailsPriceLineHeight}
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

                    <SurfaceCard
                      bg="$backgroundHover"
                      borderColor="$stitchBorder"
                      style={{
                        padding: isNarrowPhone ? 12 : isPhone ? 14 : 18,
                      }}
                    >
                      <YStack gap="$2">
                        <Text fontSize="$5" fontWeight="800" color="$color">Ocena produktu</Text>

                        {isRatingAverageLoading ? (
                          <ProductMetaText>Ładowanie średniej oceny...</ProductMetaText>
                        ) : ratingAverageError ? (
                          <Text fontSize="$2" style={{ color: '#C62828' }}>{ratingAverageError}</Text>
                        ) : (
                          <YStack gap="$1">
                            <Text color="$color" fontFamily="$heading" fontSize="$6" fontWeight="700">
                              {averageRatingLabel}
                            </Text>
                            <ProductMetaText>Liczba ocen: {ratingsCountLabel}</ProductMetaText>
                          </YStack>
                        )}

                        <XStack alignItems="center" gap={isNarrowPhone ? '$1' : '$1.5'}>
                          {PRODUCT_RATING_VALUES.map((ratingValue) => {
                            const isHighlighted = (userRating ?? 0) >= ratingValue

                            return (
                              <Pressable
                                key={ratingValue}
                                onPress={() => { void handleRateProduct(ratingValue) }}
                                disabled={!isAuthenticated || isRatingSubmitting}
                                style={({ pressed }) => ({
                                  opacity: (!isAuthenticated || isRatingSubmitting)
                                    ? 0.5
                                    : pressed
                                      ? 0.7
                                      : 1,
                                  paddingVertical: 2,
                                  paddingHorizontal: 1,
                                })}
                              >
                                <Text
                                  style={{
                                    color: isHighlighted ? '#F5B301' : '#8A8F99',
                                    fontSize: isNarrowPhone ? 24 : 28,
                                    lineHeight: isNarrowPhone ? 28 : 32,
                                  }}
                                >
                                  ★
                                </Text>
                              </Pressable>
                            )
                          })}
                        </XStack>

                        <ProductMetaText>
                          Ocenę możesz dodać po opłaconym zakupie produktu.
                        </ProductMetaText>

                        {isRatingSubmitting ? (
                          <ProductMetaText>Zapisywanie oceny...</ProductMetaText>
                        ) : null}

                        {ratingSubmitError ? (
                          <Text fontSize="$2" style={{ color: '#C62828' }}>{ratingSubmitError}</Text>
                        ) : null}

                        {ratingSubmitSuccess ? (
                          <Text fontSize="$2" style={{ color: '#1B7A37' }}>{ratingSubmitSuccess}</Text>
                        ) : null}
                      </YStack>
                    </SurfaceCard>

                    <SurfaceCard
                      bg="$backgroundHover"
                      borderColor="$stitchBorder"
                      style={{
                        padding: isNarrowPhone ? 12 : isPhone ? 14 : 18,
                      }}
                    >
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
                            <Text color="$stitchPrimary" fontSize="$2" fontWeight="700">
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

            {shouldShowRecommended ? (
              <Section>
                <SectionHeading>
                  <Eyebrow>Dla Ciebie</Eyebrow>
                </SectionHeading>
                <SimilarProductsCarousel
                  products={recommendedProducts}
                  isLoading={isRecommendedLoading}
                  error={recommendedError}
                  title="Wybrane dla Ciebie"
                  description="Spersonalizowane propozycje, wyłącznie dla Ciebie."
                  loadingMessage="Ładowanie rekomendacji dla Ciebie"
                  emptyMessage="Brak rekomendacji na ten moment"
                />
              </Section>
            ) : null}
          </Section>
        </ProductGrid>
      </ScrollView>
    </PageWrapper>
  )
}