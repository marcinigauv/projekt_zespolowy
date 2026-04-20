import React, { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { Text, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
import { pollNotificationsUseCase } from '../src/notifications/useCases'
import { getProductsUseCase, type Product } from '../src/products/useCases'
import { useCartStore } from '../src/store/cartStore'
import {
  PageWrapper,
  ProductGrid,
  BadgeRow,
  CategoryBadge,
  ProductList,
  ProductListItem,
  ProductCard,
  ProductCardAddButton,
  ProductCardFooter,
  ProductCardLinkButton,
  ProductCardSection,
  ProductInfo,
  ProductPrice,
  ProductTitle,
  ProductVisual,
  Eyebrow,
  Section,
  SectionHeading,
  SectionDescription,
  SectionTitle,
  ProductMetaRow,
  EmptyStateCard,
  SearchInput,
  SearchRow,
  SecondaryButton,
} from '../src/components/styled'

export default function Index() {
  const router = useRouter()
  const addItem = useCartStore(s => s.addItem)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useFocusEffect(
    useCallback(() => {
      void pollNotificationsUseCase()
    }, []),
  )

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

        if (!isMounted) {
          return
        }

        setProducts(result)
      } catch (caughtError) {
        if (!isMounted) {
          return
        }

        setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się pobrać produktów')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [debouncedSearchTerm])

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
                placeholder="Szukaj po nazwie lub opisie"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchTerm.length > 0 && (
                <SecondaryButton size="$4" onPress={() => setSearchTerm('')}>
                  Wyczyść
                </SecondaryButton>
              )}
            </SearchRow>

            {isLoading ? (
              <EmptyStateCard gap="$3">
                <Text fontSize="$8">…</Text>
                <Text color="$gray10" fontSize="$5">Ładowanie produktów</Text>
              </EmptyStateCard>
            ) : error ? (
              <EmptyStateCard gap="$3">
                <Text fontSize="$8">!</Text>
                <Text color="$red10" fontSize="$5">{error}</Text>
              </EmptyStateCard>
            ) : products.length === 0 ? (
              <EmptyStateCard gap="$3">
                <Text fontSize="$8">∅</Text>
                <Text color="$gray10" fontSize="$5">
                  {debouncedSearchTerm
                    ? 'Brak produktów pasujących do wyszukiwania'
                    : 'Brak produktów do wyświetlenia'}
                </Text>
              </EmptyStateCard>
            ) : (
              <ProductList>
                {products.map(product => (
                  <ProductListItem key={product.id}>
                    <ProductCard>
                      <ProductCardLinkButton onPress={() => router.push(`/products/${product.id}`)}>
                        <ProductVisual background="#F3F6FA">
                          <Text fontSize="$10" fontWeight="800" color="$blue10">
                            {product.name.slice(0, 1).toUpperCase()}
                          </Text>
                        </ProductVisual>
                        <ProductInfo>
                          <ProductCardSection>
                            <BadgeRow>
                              <CategoryBadge>
                                <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.5}>
                                  DOSTĘPNE: {product.amount}
                                </Text>
                              </CategoryBadge>
                            </BadgeRow>
                          </ProductCardSection>
                          <ProductCardSection>
                            <ProductTitle numberOfLines={2}>{product.name}</ProductTitle>
                          </ProductCardSection>
                          <ProductCardSection>
                            <ProductMetaRow>
                              <ProductPrice>{product.price.toFixed(2)} zł</ProductPrice>
                            </ProductMetaRow>
                          </ProductCardSection>
                        </ProductInfo>
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
                    </ProductCard>
                  </ProductListItem>
                ))}
              </ProductList>
            )}
          </Section>
        </ProductGrid>
      </ScrollView>
    </PageWrapper>
  )
}
