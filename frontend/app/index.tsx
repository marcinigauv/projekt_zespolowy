import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image, useWindowDimensions } from 'react-native'
import { Text, ScrollView, YStack } from 'tamagui'
import { Header } from '../src/components/Header'
import { StateMessageCard } from '../src/components/StateMessageCard'
import { useHomeScreenNotificationsPolling } from '../src/notifications/useHomeScreenNotificationsPolling'
import { getProductsUseCase, type Product } from '../src/products/useCases'
import {
  PageWrapper,
  ProductGrid,
  ProductList,
  ProductListItem,
  CatalogProductCard,
  CatalogProductPressable,
  CatalogProductMedia,
  CatalogProductMediaFrame,
  CatalogProductBody,
  CatalogProductTitle,
  CatalogProductPriceRow,
  CatalogProductDescription,
  CatalogProductPrice,
  Eyebrow,
  Section,
  SectionHeading,
  SectionDescription,
  SectionTitle,
  SearchInput,
  SearchRow,
  SecondaryButton,
} from '../src/components/styled'

const PRICE_FORMATTER = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatPrice(value: number): string {
  return `${PRICE_FORMATTER.format(value)} zł`
}

function normalizeSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return (value[0] ?? '').trim()
  }

  return (value ?? '').trim()
}

export default function Index() {
  const router = useRouter()
  const { width: viewportWidth } = useWindowDimensions()
  const params = useLocalSearchParams<{ search?: string | string[] }>()
  useHomeScreenNotificationsPolling()
  const [products, setProducts] = useState<Product[]>([])
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const isPhone = viewportWidth <= 520
  const isNarrowPhone = viewportWidth <= 390
  const isTablet = viewportWidth > 520 && viewportWidth <= 1024
  const headingMaxWidth = isPhone ? '100%' : isTablet ? 700 : 620
  const headingGap = isPhone ? 8 : 6
  const titleStyle = {
    fontSize: isPhone ? 28 : 32,
    lineHeight: isPhone ? 34 : 40,
    letterSpacing: isNarrowPhone ? -0.5 : isPhone ? -0.6 : -0.7,
    maxWidth: isPhone ? '100%' : 680,
  } as const
  const descriptionStyle = {
    maxWidth: isPhone ? '100%' : isTablet ? 620 : 560,
  } as const
  const searchRowMaxWidth = isPhone ? '100%' : isTablet ? 680 : 620

  useEffect(() => {
    const normalizedRouteSearch = normalizeSearchParam(params.search)

    setSearchTerm((current) => (current === normalizedRouteSearch ? current : normalizedRouteSearch))
    setDebouncedSearchTerm((current) => (current === normalizedRouteSearch ? current : normalizedRouteSearch))
  }, [params.search])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 400)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [searchTerm])

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        setError('')
        setIsLoading(true)

        const result = await getProductsUseCase({
          category: '',
          substring: debouncedSearchTerm,
        })

        if (!isMounted) return

        setProducts(result)
        setImageErrors({})
      } catch (caughtError) {
        if (!isMounted) return
        setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się pobrać produktów')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [debouncedSearchTerm])

  const handleClearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')

    if (normalizeSearchParam(params.search).length > 0) {
      router.replace('/')
    }
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProductGrid style={{ maxWidth: 1360 }}>
          <Section>
            <SectionHeading style={{ maxWidth: headingMaxWidth, gap: headingGap }}>
              <Eyebrow>Katalog</Eyebrow>
              <SectionTitle style={titleStyle}>Odkryj nasze produkty</SectionTitle>
              <SectionDescription style={descriptionStyle}>
                Przeglądaj nasz szeroki wybór produktów i znajdź coś dla siebie!
              </SectionDescription>
            </SectionHeading>

            <SearchRow style={{ maxWidth: searchRowMaxWidth }}>
              <SearchInput
                flex={1}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Szukaj po nazwie, opisie lub tagu"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchTerm.length > 0 && (
                <SecondaryButton size="$4" onPress={handleClearSearch} style={{ minWidth: 120 }}>
                  Wyczyść
                </SecondaryButton>
              )}
            </SearchRow>

            {isLoading ? (
              <StateMessageCard icon="…" message="Ładowanie produktów" />
            ) : error ? (
              <StateMessageCard icon="!" message={error} tone="danger" />
            ) : products.length === 0 ? (
              <StateMessageCard
                icon="∅"
                message={debouncedSearchTerm ? 'Brak produktów pasujących do wyszukiwania' : 'Brak produktów do wyświetlenia'}
              />
            ) : (
              <ProductList>
                {products.map((product) => {
                  return (
                    <ProductListItem key={product.id}>
                      <CatalogProductCard hoverStyle={{ scale: 1.015 }}>
                        <CatalogProductPressable
                          onPress={() => router.push(`/products/${product.id}`)}
                        >
                          <CatalogProductMedia>
                            <CatalogProductMediaFrame>
                              {product.imageUrl && !imageErrors[product.id] ? (
                                <Image
                                  source={{ uri: product.imageUrl }}
                                  resizeMode="cover"
                                  onError={() => setImageErrors((prev) => ({ ...prev, [product.id]: true }))}
                                  style={{ width: '100%', height: '100%' }}
                                />
                              ) : imageErrors[product.id] ? (
                                <YStack flex={1} width="100%" alignItems="center" justifyContent="center" px="$3">
                                  <Text color="$placeholderColor" fontSize="$3" fontWeight="600" style={{ textAlign: 'center' }}>
                                    Zdjęcie produktu niedostępne
                                  </Text>
                                </YStack>
                              ) : (
                                <YStack flex={1} width="100%" alignItems="center" justifyContent="center">
                                  <Text fontFamily="$heading" fontWeight="800" color="$blue10" fontSize="$8" lineHeight="$8" style={{ textAlign: 'center' }}>
                                    {product.name.slice(0, 1).toUpperCase()}
                                  </Text>
                                </YStack>
                              )}
                            </CatalogProductMediaFrame>
                          </CatalogProductMedia>

                          <CatalogProductBody>
                            <CatalogProductTitle numberOfLines={2}>
                              {product.name}
                            </CatalogProductTitle>

                            <CatalogProductPriceRow>
                              <CatalogProductPrice>{formatPrice(product.price)}</CatalogProductPrice>
                            </CatalogProductPriceRow>

                            <CatalogProductDescription numberOfLines={1}>
                              DOSTĘPNE: {product.amount} szt.
                            </CatalogProductDescription>
                          </CatalogProductBody>
                        </CatalogProductPressable>
                      </CatalogProductCard>
                    </ProductListItem>
                  )
                })}
              </ProductList>
            )}
          </Section>
        </ProductGrid>
      </ScrollView>
    </PageWrapper>
  )
}