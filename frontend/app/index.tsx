import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Image } from 'react-native'
import { Text, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
import { StateMessageCard } from '../src/components/StateMessageCard'
import { useHomeScreenNotificationsPolling } from '../src/notifications/useHomeScreenNotificationsPolling'
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
  SearchInput,
  SearchRow,
  SecondaryButton,
} from '../src/components/styled'

export default function Index() {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  useHomeScreenNotificationsPolling()
  const [products, setProducts] = useState<Product[]>([])
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
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

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <ProductGrid>
          <Section>
            <SectionHeading>
              <Eyebrow color="#6c757d">Katalog</Eyebrow>
              <SectionTitle color="#212529">Odkryj nasze produkty</SectionTitle>
              <SectionDescription color="#6c757d">
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
                {products.map((product) => (
                  <ProductListItem key={product.id}>
                    <ProductCard hoverStyle={{ scale: 1.03 }}>
                      <ProductCardLinkButton background="#f8f9fa" style={{ borderWidth: 0 }} onPress={() => router.push(`/products/${product.id}`)}>
                        <ProductVisual>
                          {product.imageUrl && !imageErrors[product.id] ? (
                            <Image
                              source={{ uri: product.imageUrl }}
                              resizeMode="cover"
                              onError={() => setImageErrors((prev) => ({ ...prev, [product.id]: true }))}
                              style={{ width: '100%', height: '100%' }}
                            />
                          ) : imageErrors[product.id] ? (
                            <Text color="#6c757d" fontSize="$3" fontWeight="600" px="$3" style={{ textAlign: 'center' }}>
                              Zdjęcie produktu niedostępne
                            </Text>
                          ) : (
                            <Text fontWeight="900" color="#0d6efd" style={{ fontFamily: 'Segoe UI', fontSize: '6em', height: 160, backgroundColor: '#e7f1ff', lineHeight: 140, textAlign: 'center' }}>
                              {product.name.slice(0, 1).toUpperCase()}
                            </Text>
                          )}
                        </ProductVisual>
                        <ProductInfo>
                          <ProductCardSection>
                            <BadgeRow>
                              <CategoryBadge style={{ backgroundColor: '#fff3cd' }}>
                                <Text fontSize="$1" color="#856404" fontWeight="600" letterSpacing={0.5}>
                                  DOSTĘPNE: {product.amount}
                                </Text>
                              </CategoryBadge>
                            </BadgeRow>
                          </ProductCardSection>
                          <ProductCardSection>
                            <ProductTitle numberOfLines={2} color="#212529">{product.name}</ProductTitle>
                          </ProductCardSection>
                          <ProductCardSection>
                            <ProductMetaRow>
                              <ProductPrice color="#212529" style={{ width: '100%', textAlign: 'right' }}>{product.price.toFixed(2)} zł</ProductPrice>
                            </ProductMetaRow>
                          </ProductCardSection>
                        </ProductInfo>
                      </ProductCardLinkButton>
                      <ProductCardFooter>
                        <ProductCardAddButton
                          size="$3"
                          style={{ backgroundColor: '#0d6efd' }}
                          onPress={() => addItem({ id: product.id, name: product.name, price: product.price })}
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