import React, { useEffect, useState } from 'react'
import { Image, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, YStack } from 'tamagui'
import { Header } from '../../components/Header'
import { StateMessageCard } from '../../components/StateMessageCard'
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
  DataRow,
  Eyebrow,
  PageWrapper,
  ProductDetailLayout,
  ProductHeroMedia,
  ProductImagePlaceholder,
  ProductInfoColumn,
  ProductMediaColumn,
  ProductMetaText,
  ProductPrice,
  ProductGrid,
  Section,
  SectionDescription,
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
      <Text fontWeight="900" color="#0d6efd" style={{ fontWeight: '900', fontFamily: 'Segoe UI', fontSize: '6em' }}>
        {product.name.slice(0, 1).toUpperCase()}
      </Text>
    </ProductImagePlaceholder>
  )
}

export function ProductDetailsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string | string[] }>()
  const addItem = useCartStore((state) => state.addItem)
  useScreenNotificationsPolling()
  const productId = parsePositiveIntParam(params.id)
  const [product, setProduct] = useState<Product | null>(null)
  const [productError, setProductError] = useState('')
  const [isProductLoading, setIsProductLoading] = useState(true)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [similarError, setSimilarError] = useState('')
  const [isSimilarLoading, setIsSimilarLoading] = useState(true)

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
        <ProductGrid>
          <Section>
            <BackLinkButton onPress={() => router.push('/')}>
              <Text color="#0d6efd" fontSize="$4" fontWeight="700">Powrót do katalogu</Text>
            </BackLinkButton>

            {isProductLoading ? (
              <StateMessageCard icon="…" message="Ładowanie produktu" />
            ) : productError || !product ? (
              <StateMessageCard icon="!" message={productError || 'Nie znaleziono produktu'} tone="danger" />
            ) : (
              <SurfaceCard background="#f8f9fa" gap="$5">
                <ProductDetailLayout>
                  <ProductMediaColumn>
                    <ProductHeroMedia>
                      <ProductHeroImage product={product} />
                    </ProductHeroMedia>
                  </ProductMediaColumn>

                  <ProductInfoColumn>
                    <SectionHeading>
                      <Eyebrow color="#6c757d">Produkt</Eyebrow>
                      <SectionTitle color="#212529">{product.name}</SectionTitle>
                      <SectionDescription color="#6c757d">
                        Sprawdź szczegóły produktu, dostępność i propozycje podobnych pozycji.
                      </SectionDescription>
                    </SectionHeading>

                    <BadgeRow>
                      <CategoryBadge style={{ backgroundColor: '#fff3cd' }}>
                        <Text fontSize="$1" color="#856404" fontWeight="600" letterSpacing={0.5}>
                          DOSTĘPNE: {product.amount}
                        </Text>
                      </CategoryBadge>
                      {product.categories.map((category) => (
                        <CategoryBadge key={`${product.id}-${category}`} style={{ backgroundColor: '#e7f1ff' }}>
                          <Text fontSize="$1" color="#0d6efd" fontWeight="600" letterSpacing={0.5}>
                            {category}
                          </Text>
                        </CategoryBadge>
                      ))}
                    </BadgeRow>

                    <ProductPrice color="#212529">{product.price.toFixed(2)} zł</ProductPrice>

                    <SurfaceCard style={{ backgroundColor: '#ffffff' }}>
                      <YStack gap="$2">
                        <Text fontSize="$5" fontWeight="800" color="#212529">Opis</Text>
                        <ProductMetaText color="#495057">{product.description}</ProductMetaText>
                      </YStack>
                    </SurfaceCard>

                    <DataRow>
                      <SecondaryButton size="$4" $xs={{ width: '100%' }} onPress={() => router.push('/cart')}>
                        Przejdź do koszyka
                      </SecondaryButton>
                      <AddToCartButton
                        size="$4"
                        style={{ backgroundColor: '#0d6efd' }}
                        onPress={() =>
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                          })
                        }
                      >
                        Dodaj do koszyka
                      </AddToCartButton>
                    </DataRow>
                  </ProductInfoColumn>
                </ProductDetailLayout>
              </SurfaceCard>
            )}

            <Section>
              <SectionHeading>
                <Eyebrow color="#6c757d">Inspiracje</Eyebrow>
                <SectionTitle color="#212529">Podobne produkty</SectionTitle>
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