import React, { useEffect, useState } from 'react'
import { Text, ScrollView, XStack } from 'tamagui'
import { Header } from '../src/components/Header'
import { getProductsUseCase, type Product } from '../src/products/useCases'
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
  SectionDescription,
  SectionTitle,
  ProductMetaRow,
  ProductMetaText,
  EmptyStateCard,
  SearchInput,
  SearchRow,
  SecondaryButton,
} from '../src/components/styled'

export default function Index() {
  const addItem = useCartStore(s => s.addItem)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
                      <ProductVisual background="#F3F6FA">
                        <Text fontSize="$10" fontWeight="800" color="$blue10">
                          {product.name.slice(0, 1).toUpperCase()}
                        </Text>
                      </ProductVisual>
                      <ProductInfo>
                        <XStack>
                          <CategoryBadge>
                            <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.5}>
                              DOSTĘPNE: {product.amount}
                            </Text>
                          </CategoryBadge>
                        </XStack>
                        <ProductTitle numberOfLines={2}>{product.name}</ProductTitle>
                        <ProductMetaText numberOfLines={3}>
                          {product.description}
                        </ProductMetaText>
                        <ProductMetaRow>
                          <ProductPrice>{product.price.toFixed(2)} zł</ProductPrice>
                          <AddToCartButton
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
                          </AddToCartButton>
                        </ProductMetaRow>
                      </ProductInfo>
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
