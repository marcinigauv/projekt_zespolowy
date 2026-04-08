import React, { useEffect, useState } from 'react'
import { Image } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, YStack } from 'tamagui'
import { Header } from '../../components/Header'
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
  EmptyStateCard,
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

function parseProductId(value: string | string[] | undefined): number | null {
  if (Array.isArray(value)) {
    return parseProductId(value[0])
  }

  if (!value) {
    return null
  }

  const parsedValue = Number(value)

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null
  }

  return parsedValue
}

function ProductHeroImage({ product }: { product: Product }) {
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
      <Text fontSize="$10" fontWeight="800" color="$blue10">
        {product.name.slice(0, 1).toUpperCase()}
      </Text>
    </ProductImagePlaceholder>
  )
}

export function ProductDetailsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string | string[] }>()
  const addItem = useCartStore((state) => state.addItem)
  const productId = parseProductId(params.id)
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
      return () => {
        isMounted = false
      }
    }

    const loadProduct = async () => {
      try {
        setProductError('')
        setIsProductLoading(true)

        const result = await getProductUseCase({ id: productId })

        if (!isMounted) {
          return
        }

        setProduct(result)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setProduct(null)
        setProductError(error instanceof Error ? error.message : 'Nie udało się pobrać produktu')
      } finally {
        if (isMounted) {
          setIsProductLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      isMounted = false
    }
  }, [productId])

  useEffect(() => {
    let isMounted = true

    if (productId === null) {
      setSimilarProducts([])
      setSimilarError('Nie można pobrać podobnych produktów dla nieprawidłowego identyfikatora')
      setIsSimilarLoading(false)
      return () => {
        isMounted = false
      }
    }

    const loadSimilarProducts = async () => {
      try {
        setSimilarError('')
        setIsSimilarLoading(true)

        const result = await getSimilarProductsUseCase({ id: productId })

        if (!isMounted) {
          return
        }

        setSimilarProducts(result)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setSimilarProducts([])
        setSimilarError(error instanceof Error ? error.message : 'Nie udało się pobrać podobnych produktów')
      } finally {
        if (isMounted) {
          setIsSimilarLoading(false)
        }
      }
    }

    void loadSimilarProducts()

    return () => {
      isMounted = false
    }
  }, [productId])

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <ProductGrid>
          <Section>
            <BackLinkButton onPress={() => router.push('/')}>
              <Text color="$blue10" fontSize="$4" fontWeight="700">Powrót do katalogu</Text>
            </BackLinkButton>

            {isProductLoading ? (
              <EmptyStateCard gap="$3">
                <Text fontSize="$8">…</Text>
                <Text color="$gray10" fontSize="$5">Ładowanie produktu</Text>
              </EmptyStateCard>
            ) : productError || !product ? (
              <EmptyStateCard gap="$3">
                <Text fontSize="$8">!</Text>
                <Text color="$red10" fontSize="$5">{productError || 'Nie znaleziono produktu'}</Text>
              </EmptyStateCard>
            ) : (
              <SurfaceCard gap="$5">
                <ProductDetailLayout>
                  <ProductMediaColumn>
                    <ProductHeroMedia>
                      <ProductHeroImage product={product} />
                    </ProductHeroMedia>
                  </ProductMediaColumn>

                  <ProductInfoColumn>
                    <SectionHeading>
                      <Eyebrow>Produkt</Eyebrow>
                      <SectionTitle>{product.name}</SectionTitle>
                      <SectionDescription>
                        Sprawdź szczegóły produktu, dostępność i propozycje podobnych pozycji.
                      </SectionDescription>
                    </SectionHeading>

                    <BadgeRow>
                      <CategoryBadge>
                        <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.5}>
                          DOSTĘPNE: {product.amount}
                        </Text>
                      </CategoryBadge>
                      {product.categories.map((category) => (
                        <CategoryBadge key={`${product.id}-${category}`}>
                          <Text fontSize="$1" color="$blue10" fontWeight="600" letterSpacing={0.5}>
                            {category}
                          </Text>
                        </CategoryBadge>
                      ))}
                    </BadgeRow>

                    <ProductPrice>{product.price.toFixed(2)} zł</ProductPrice>

                    <SurfaceCard>
                      <YStack gap="$2">
                        <Text fontSize="$5" fontWeight="800">Opis</Text>
                        <ProductMetaText>{product.description}</ProductMetaText>
                      </YStack>
                    </SurfaceCard>

                    <DataRow>
                      <SecondaryButton size="$4" onPress={() => router.push('/cart')}>
                        Przejdź do koszyka
                      </SecondaryButton>
                      <AddToCartButton
                        size="$4"
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
                <Eyebrow>Inspiracje</Eyebrow>
                <SectionTitle>Podobne produkty</SectionTitle>
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