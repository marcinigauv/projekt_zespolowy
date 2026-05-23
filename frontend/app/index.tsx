import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'react-native'
import { Text, ScrollView } from 'tamagui'
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
  const params = useLocalSearchParams<{ search?: string | string[] }>()
  useHomeScreenNotificationsPolling()
  const [products, setProducts] = useState<Product[]>([])
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
      <ScrollView>
        <ProductGrid>
          <Section>
            <SectionHeading>
              <Eyebrow>Katalog</Eyebrow>
              <SectionTitle>Odkryj nasze produkty</SectionTitle>
              <SectionDescription>
                Przeglądaj nasz szeroki wybór produktów i znajdź coś dla siebie!
              </SectionDescription>
            </SectionHeading>

            <SearchRow>
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
                <SecondaryButton size="$4" onPress={handleClearSearch}>
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
                      <CatalogProductCard hoverStyle={{ scale: 1.01 }}>
                        <CatalogProductPressable
                          onPress={() => router.push(`/products/${product.id}`)}
                        >
                          <CatalogProductMedia>
                            <CatalogProductMediaFrame>
                              {product.imageUrl && !imageErrors[product.id] ? (
                                <Image
                                  source={{ uri: product.imageUrl }}
                                  resizeMode="contain"
                                  onError={() => setImageErrors((prev) => ({ ...prev, [product.id]: true }))}
                                  style={{ width: '100%', height: '100%' }}
                                />
                              ) : imageErrors[product.id] ? (
                                <Text color="$placeholderColor" fontSize="$3" fontWeight="600" px="$3" style={{ textAlign: 'center' }}>
                                  Zdjęcie produktu niedostępne
                                </Text>
                              ) : (
                                <Text fontFamily="$heading" fontWeight="700" color="$blue10" fontSize="$9" lineHeight="$9" style={{ textAlign: 'center' }}>
                                  {product.name.slice(0, 1).toUpperCase()}
                                </Text>
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