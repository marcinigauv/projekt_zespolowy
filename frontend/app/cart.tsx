import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Image, Pressable, useWindowDimensions } from 'react-native'
import { XStack, YStack, Text, ScrollView } from 'tamagui'
import { Header } from '../src/components/Header'
import { formatCurrency } from '../src/lib/formatters'
import { useScreenNotificationsPolling } from '../src/notifications/useHomeScreenNotificationsPolling'
import { createOrderCommandFromCart, createOrderUseCase } from '../src/orders/useCases'
import { getProductUseCase } from '../src/products/useCases'
import { useAuthStore } from '../src/store/authStore'
import { useCartStore } from '../src/store/cartStore'
import {
  PageWrapper,
  PageContent,
  DataRow,
  Eyebrow,
  EmptyStateCard,
  GhostDangerButton,
  InlineControls,
  PrimaryButton,
  SecondaryButton,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  SurfaceCard,
  ProductMetaText,
  ProductPrice,
  ProductTitle,
} from '../src/components/styled'

function getProductNoun(value: number): string {
  const normalized = Math.abs(value)

  if (normalized === 1) {
    return 'produkt'
  }

  const mod10 = normalized % 10
  const mod100 = normalized % 100

  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return 'produkty'
  }

  return 'produktów'
}

export default function Cart() {
  const router = useRouter()
  const { width: viewportWidth } = useWindowDimensions()
  const isPhone = viewportWidth <= 520
  const isTablet = viewportWidth > 520 && viewportWidth <= 900
  const isCompact = viewportWidth <= 900
  const isTiny = viewportWidth <= 390
  const controlSize = isTiny ? 32 : 36
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const requestedImageIdsRef = useRef<Record<number, boolean>>({})
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  useScreenNotificationsPolling()
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const setItemImageUrl = useCartStore((state) => state.setItemImageUrl)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const order = await createOrderUseCase(createOrderCommandFromCart(items))
    clearCart()
    router.replace(`/orders/${order.id}`)
  }

  useEffect(() => {
    let isActive = true

    const itemsWithoutImageUrl = items.filter((item) => !item.imageUrl)

    if (itemsWithoutImageUrl.length === 0) {
      return () => {
        isActive = false
      }
    }

    itemsWithoutImageUrl.forEach((item) => {
      if (requestedImageIdsRef.current[item.id]) {
        return
      }

      requestedImageIdsRef.current[item.id] = true

      void (async () => {
        try {
          const product = await getProductUseCase({ id: item.id })

          if (!isActive) {
            return
          }

          if (product.imageUrl) {
            setItemImageUrl(item.id, product.imageUrl)
          }
        } catch {
          // Silently ignore image hydration failures and keep text fallback.
        }
      })()
    })

    return () => {
      isActive = false
    }
  }, [items, setItemImageUrl])

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent style={{ maxWidth: isCompact ? 980 : 1180 }}>
          <SectionHeading style={{ maxWidth: '100%' }}>
            <XStack
              width="100%"
              gap="$3"
              justifyContent="space-between"
              alignItems={isPhone ? 'flex-start' : 'center'}
              flexDirection={isPhone ? 'column' : 'row'}
            >
              <YStack gap="$1.5" style={{ minWidth: 0, flex: 1 }}>
                <Eyebrow>Koszyk</Eyebrow>
                <SectionTitle>Koszyk ({totalItems} {getProductNoun(totalItems)})</SectionTitle>
                <SectionDescription>
                  Zarządzaj liczbą produktów, następnie przejdź do finalizacji zamówienia.
                </SectionDescription>
              </YStack>

              {items.length > 0 ? (
                <GhostDangerButton
                  size="$3"
                  onPress={clearCart}
                  alignSelf={isPhone ? 'flex-end' : 'center'}
                >
                  Wyczyść koszyk
                </GhostDangerButton>
              ) : null}
            </XStack>
          </SectionHeading>

          {items.length === 0 ? (
            <EmptyStateCard gap="$3">
              <Text fontSize="$8">🛒</Text>
              <Text color="$gray10" fontSize="$5">Twój koszyk jest pusty</Text>
              <SectionDescription style={{ textAlign: 'center' }}>
                Dodaj produkty z katalogu, aby przejść do finalizacji zamówienia.
              </SectionDescription>
              <PrimaryButton onPress={() => router.push('/')}>Przejdź do katalogu</PrimaryButton>
            </EmptyStateCard>
          ) : (
            isCompact ? (
              <YStack gap="$4" width="100%" style={{ minWidth: 0 }}>
                <YStack gap="$3.5" width="100%" style={{ minWidth: 0 }}>
                  {items.map((item) => (
                    <SurfaceCard key={item.id} style={{ width: '100%' }}>
                      <YStack gap="$2.5" width="100%" style={{ minWidth: 0 }}>
                        <XStack
                          gap="$2.5"
                          width="100%"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <XStack gap="$2.5" alignItems="center" flex={1} style={{ minWidth: 0 }}>
                            <YStack
                              width={isPhone ? 56 : 64}
                              height={isPhone ? 56 : 64}
                              borderRadius="$6"
                              borderWidth={1}
                              borderColor="$borderColor"
                              bg="$backgroundHover"
                              overflow="hidden"
                              alignItems="center"
                              justifyContent="center"
                              style={{ flexShrink: 0 }}
                            >
                              {item.imageUrl && !imageErrors[item.id] ? (
                                <Image
                                  source={{ uri: item.imageUrl }}
                                  resizeMode="cover"
                                  onError={() => {
                                    setImageErrors((current) => ({ ...current, [item.id]: true }))
                                  }}
                                  style={{ width: '100%', height: '100%' }}
                                />
                              ) : (
                                <Text fontFamily="$heading" fontWeight="700" fontSize={isPhone ? '$5' : '$6'} color="$blue10">
                                  {item.name.slice(0, 1).toUpperCase()}
                                </Text>
                              )}
                            </YStack>

                            <YStack gap="$0.5" flex={1} style={{ minWidth: 0 }}>
                              <Pressable
                                onPress={() => router.push(`/products/${item.id}`)}
                                style={({ pressed }) => ({
                                  opacity: pressed ? 0.78 : 1,
                                  width: '100%',
                                })}
                              >
                                <ProductTitle numberOfLines={2} style={{ width: '100%' }}>
                                  {item.name}
                                </ProductTitle>
                              </Pressable>
                              <ProductMetaText>Cena jednostkowa: {formatCurrency(item.price)}</ProductMetaText>
                            </YStack>
                          </XStack>

                          <GhostDangerButton
                            size="$2"
                            onPress={() => removeItem(item.id)}
                            style={{ flexShrink: 0, marginTop: 2 }}
                          >
                            Usuń
                          </GhostDangerButton>
                        </XStack>

                        <XStack gap="$2.5" width="100%" justifyContent="space-between" alignItems="center">
                          <InlineControls
                            borderWidth={1}
                            borderColor="$borderColor"
                            borderRadius="$6"
                            px="$2"
                            py="$1"
                            bg="$backgroundHover"
                            style={{
                              minWidth: 150,
                              justifyContent: 'space-between',
                            }}
                          >
                            <SecondaryButton
                              size="$3"
                              circular
                              onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              style={{ width: controlSize, height: controlSize, minWidth: controlSize, paddingHorizontal: 0 }}
                            >
                              -
                            </SecondaryButton>

                            <YStack
                              alignItems="center"
                              justifyContent="center"
                              minWidth={controlSize}
                              height={controlSize}
                              borderRadius="$4"
                              borderWidth={1}
                              borderColor="$borderColor"
                              bg="$background"
                            >
                              <Text fontSize="$5" fontWeight="700" style={{ minWidth: 24, textAlign: 'center' }}>
                                {item.quantity}
                              </Text>
                            </YStack>

                            <SecondaryButton
                              size="$3"
                              circular
                              onPress={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{ width: controlSize, height: controlSize, minWidth: controlSize, paddingHorizontal: 0 }}
                            >
                              +
                            </SecondaryButton>
                          </InlineControls>

                          <YStack alignItems="flex-end" style={{ minWidth: 132 }}>
                            <ProductMetaText>Wartość pozycji</ProductMetaText>
                            <ProductPrice>{formatCurrency(item.price * item.quantity)}</ProductPrice>
                          </YStack>
                        </XStack>
                      </YStack>
                    </SurfaceCard>
                  ))}
                </YStack>

                <SurfaceCard>
                  <YStack gap="$3.5">
                    <Text fontFamily="$heading" fontSize="$6" fontWeight="600">Podsumowanie</Text>

                    <DataRow>
                      <ProductMetaText>Pozycje w koszyku</ProductMetaText>
                      <Text fontSize="$4" fontWeight="700">{items.length}</Text>
                    </DataRow>

                    <DataRow>
                      <ProductMetaText>Łączna liczba sztuk</ProductMetaText>
                      <Text fontSize="$4" fontWeight="700">{totalItems}</Text>
                    </DataRow>

                    <YStack
                      gap="$1.5"
                      borderTopWidth={1}
                      borderColor="$borderColor"
                      pt="$3"
                    >
                      <DataRow>
                        <Text fontSize="$3" color="$placeholderColor" fontWeight="600">Do zapłaty</Text>
                        <Text fontFamily="$heading" fontSize="$7" fontWeight="700" color="$color">
                          {formatCurrency(totalPrice)}
                        </Text>
                      </DataRow>
                    </YStack>

                    <PrimaryButton onPress={() => { void handleCheckout() }} width="100%">
                      Przejdź do dostawy
                    </PrimaryButton>

                    <ProductMetaText>
                      Produkty w koszyku nie są rezerwowane do czasu złożenia zamówienia.
                    </ProductMetaText>
                  </YStack>
                </SurfaceCard>
              </YStack>
            ) : (
              <XStack gap="$4" width="100%" alignItems="flex-start" style={{ minWidth: 0 }}>
                <YStack flex={1} gap="$3.5" width="100%" style={{ minWidth: 460 }}>
                  {items.map((item) => (
                    <SurfaceCard key={item.id} style={{ width: '100%' }}>
                      <YStack gap="$3" width="100%" style={{ minWidth: 0 }}>
                        <XStack gap="$3" width="100%" justifyContent="space-between" alignItems={isTablet ? 'flex-start' : 'center'}>
                          <XStack gap="$3" alignItems="center" flex={1} style={{ minWidth: 0 }}>
                            <YStack
                              width={70}
                              height={70}
                              borderRadius="$6"
                              borderWidth={1}
                              borderColor="$borderColor"
                              bg="$backgroundHover"
                              overflow="hidden"
                              alignItems="center"
                              justifyContent="center"
                              style={{ flexShrink: 0 }}
                            >
                              {item.imageUrl && !imageErrors[item.id] ? (
                                <Image
                                  source={{ uri: item.imageUrl }}
                                  resizeMode="cover"
                                  onError={() => {
                                    setImageErrors((current) => ({ ...current, [item.id]: true }))
                                  }}
                                  style={{ width: '100%', height: '100%' }}
                                />
                              ) : (
                                <Text fontFamily="$heading" fontWeight="700" fontSize="$6" color="$blue10">
                                  {item.name.slice(0, 1).toUpperCase()}
                                </Text>
                              )}
                            </YStack>

                            <YStack gap="$1" flex={1} style={{ minWidth: 0 }}>
                              <Pressable
                                onPress={() => router.push(`/products/${item.id}`)}
                                style={({ pressed }) => ({
                                  opacity: pressed ? 0.78 : 1,
                                  width: '100%',
                                })}
                              >
                                <ProductTitle numberOfLines={2} style={{ width: '100%' }}>
                                  {item.name}
                                </ProductTitle>
                              </Pressable>
                              <ProductMetaText>Cena jednostkowa: {formatCurrency(item.price)}</ProductMetaText>
                            </YStack>
                          </XStack>

                          <GhostDangerButton size="$2" onPress={() => removeItem(item.id)} style={{ flexShrink: 0 }}>
                            Usuń
                          </GhostDangerButton>
                        </XStack>

                        <XStack gap="$3" width="100%" justifyContent="space-between" alignItems="center">
                          <InlineControls
                            borderWidth={1}
                            borderColor="$borderColor"
                            borderRadius="$6"
                            px="$2"
                            py="$1"
                            bg="$backgroundHover"
                            style={{ minWidth: 160, justifyContent: 'space-between' }}
                          >
                            <SecondaryButton
                              size="$3"
                              circular
                              onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              style={{ width: 36, height: 36, minWidth: 36, paddingHorizontal: 0 }}
                            >
                              -
                            </SecondaryButton>
                            <YStack alignItems="center" justifyContent="center" minWidth={36} height={36} borderRadius="$4" borderWidth={1} borderColor="$borderColor" bg="$background">
                              <Text fontSize="$5" fontWeight="700" style={{ minWidth: 24, textAlign: 'center' }}>
                                {item.quantity}
                              </Text>
                            </YStack>
                            <SecondaryButton
                              size="$3"
                              circular
                              onPress={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{ width: 36, height: 36, minWidth: 36, paddingHorizontal: 0 }}
                            >
                              +
                            </SecondaryButton>
                          </InlineControls>

                          <YStack alignItems="flex-end" style={{ minWidth: 150 }}>
                            <ProductMetaText>Wartość pozycji</ProductMetaText>
                            <ProductPrice>{formatCurrency(item.price * item.quantity)}</ProductPrice>
                          </YStack>
                        </XStack>
                      </YStack>
                    </SurfaceCard>
                  ))}
                </YStack>

                <YStack width={340} gap="$3" style={{ minWidth: 0, flexShrink: 0 }}>
                  <SurfaceCard>
                    <YStack gap="$3.5">
                      <Text fontFamily="$heading" fontSize="$6" fontWeight="600">Podsumowanie</Text>

                      <DataRow>
                        <ProductMetaText>Pozycje w koszyku</ProductMetaText>
                        <Text fontSize="$4" fontWeight="700">{items.length}</Text>
                      </DataRow>

                      <DataRow>
                        <ProductMetaText>Łączna liczba sztuk</ProductMetaText>
                        <Text fontSize="$4" fontWeight="700">{totalItems}</Text>
                      </DataRow>

                      <YStack gap="$1.5" borderTopWidth={1} borderColor="$borderColor" pt="$3">
                        <DataRow>
                          <Text fontSize="$3" color="$placeholderColor" fontWeight="600">Do zapłaty</Text>
                          <Text fontFamily="$heading" fontSize="$7" fontWeight="700" color="$color">
                            {formatCurrency(totalPrice)}
                          </Text>
                        </DataRow>
                      </YStack>

                      <PrimaryButton onPress={() => { void handleCheckout() }} width="100%">
                        Przejdź do dostawy
                      </PrimaryButton>

                      <ProductMetaText>
                        Produkty w koszyku nie są rezerwowane do czasu złożenia zamówienia.
                      </ProductMetaText>
                    </YStack>
                  </SurfaceCard>
                </YStack>
              </XStack>
            )
          )}
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}
