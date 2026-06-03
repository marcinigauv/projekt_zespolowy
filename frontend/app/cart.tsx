import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Image, Pressable, useWindowDimensions } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { XStack, YStack, Text, ScrollView, getVariableValue, useTheme } from 'tamagui'
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
  const theme = useTheme()
  const { width: viewportWidth } = useWindowDimensions()
  const isPhone = viewportWidth <= 520
  const isTablet = viewportWidth > 520 && viewportWidth <= 900
  const isCompact = viewportWidth <= 900
  const isTiny = viewportWidth <= 390
  const controlSize = isTiny ? 36 : isPhone ? 40 : 40
  const cardRadius = isPhone ? 18 : 20
  const itemCardPadding = isPhone ? 14 : isCompact ? 16 : 18
  const summaryCardPadding = isPhone ? 16 : isCompact ? 18 : 22
  const mediaFrameSize = isPhone ? 68 : isCompact ? 80 : 92
  const itemValueCardMinWidth = isPhone ? 0 : isCompact ? 216 : 236
  const primaryColor = getVariableValue(theme.stitchPrimary)
  const surfaceColor = getVariableValue(theme.backgroundHover)
  const borderToneColor = getVariableValue(theme.stitchBorder)
  const baseSurfaceColor = getVariableValue(theme.background)
  const primaryContainerColor = getVariableValue(theme.stitchPrimaryContainer)
  const textColor = getVariableValue(theme.color)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [checkoutError, setCheckoutError] = useState('')
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

    try {
      setCheckoutError('')
      const order = await createOrderUseCase(createOrderCommandFromCart(items))
      clearCart()
      router.replace(`/orders/${order.id}`)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Nie udało się złożyć zamówienia')
    }
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
              flexDirection={isPhone ? 'column' : 'row'}
              style={{ justifyContent: 'space-between', alignItems: isPhone ? 'flex-start' : 'center' }}
            >
              <YStack gap="$1.5" style={{ minWidth: 0, flex: 1 }}>
                <Eyebrow>Koszyk</Eyebrow>
                <SectionTitle>Koszyk ({totalItems} {getProductNoun(totalItems)})</SectionTitle>
                <SectionDescription>
                  Zarządzaj liczbą produktów, następnie przejdź do finalizacji zamówienia.
                </SectionDescription>
                {checkoutError ? <Text color="$red10">{checkoutError}</Text> : null}
              </YStack>

              {items.length > 0 ? (
                <GhostDangerButton
                  size="$3"
                  onPress={clearCart}
                  style={{
                    alignSelf: isPhone ? 'flex-end' : 'center',
                    borderWidth: 1,
                    borderColor: '#f2b8b5',
                    backgroundColor: '#ffdad6',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  Wyczyść koszyk
                </GhostDangerButton>
              ) : null}
            </XStack>
          </SectionHeading>

          {items.length === 0 ? (
            <EmptyStateCard
              gap="$4"
              style={{
                minHeight: isPhone ? 280 : 320,
                justifyContent: 'center',
                paddingHorizontal: isPhone ? 20 : 28,
                paddingVertical: isPhone ? 32 : 44,
              }}
            >
              <YStack
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isPhone ? 68 : 76,
                  height: isPhone ? 68 : 76,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: borderToneColor,
                  backgroundColor: primaryContainerColor,
                }}
              >
                <MaterialIcons name="shopping-cart" size={isPhone ? 30 : 34} color={primaryColor} />
              </YStack>
              <Text
                color="$color"
                fontFamily="$heading"
                fontSize={isPhone ? '$6' : '$7'}
                fontWeight="600"
                style={{ textAlign: 'center' }}
              >
                Twój koszyk jest pusty
              </Text>
              <SectionDescription style={{ textAlign: 'center' }}>
                Dodaj produkty z katalogu, aby przejść do finalizacji zamówienia.
              </SectionDescription>
              <PrimaryButton
                onPress={() => router.push('/')}
                style={{
                  minHeight: 56,
                  width: isPhone ? '100%' : undefined,
                  minWidth: isPhone ? undefined : 220,
                }}
              >
                Przejdź do katalogu
              </PrimaryButton>
            </EmptyStateCard>
          ) : (
            isCompact ? (
              <YStack gap="$4" width="100%" style={{ minWidth: 0 }}>
                <YStack gap="$3.5" width="100%" style={{ minWidth: 0 }}>
                  {items.map((item) => (
                    <SurfaceCard
                      key={item.id}
                      style={{
                        width: '100%',
                        padding: itemCardPadding,
                        borderRadius: cardRadius,
                      }}
                    >
                      <YStack gap="$3" width="100%" style={{ minWidth: 0 }}>
                        <XStack
                          gap="$2.5"
                          width="100%"
                          style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                        >
                          <XStack gap="$2.5" flex={1} style={{ minWidth: 0, alignItems: 'center' }}>
                            <YStack
                              width={mediaFrameSize}
                              height={mediaFrameSize}
                              borderWidth={1}
                              borderColor="$borderColor"
                              bg="$backgroundHover"
                              overflow="hidden"
                              style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                borderRadius: 18,
                                padding: isPhone ? 6 : 8,
                              }}
                            >
                              <YStack
                                width="100%"
                                height="100%"
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 14,
                                  overflow: 'hidden',
                                  borderWidth: 1,
                                  borderColor: borderToneColor,
                                  backgroundColor: baseSurfaceColor,
                                }}
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
                                  <Text fontFamily="$heading" fontWeight="700" fontSize={isPhone ? '$5' : '$6'} color={primaryColor}>
                                    {item.name.slice(0, 1).toUpperCase()}
                                  </Text>
                                )}
                              </YStack>
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
                              <ProductMetaText fontFamily="$mono" style={{ letterSpacing: 0.5 }}>
                                Cena jednostkowa: {formatCurrency(item.price)}
                              </ProductMetaText>
                            </YStack>
                          </XStack>

                          <GhostDangerButton
                            size="$2"
                            onPress={() => removeItem(item.id)}
                            style={{
                              flexShrink: 0,
                              marginTop: 2,
                              borderWidth: 1,
                              borderColor: '#f2b8b5',
                              backgroundColor: '#ffdad6',
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                            }}
                          >
                            Usuń
                          </GhostDangerButton>
                        </XStack>

                        <XStack
                          gap="$2.5"
                          width="100%"
                          flexDirection={isPhone ? 'column' : 'row'}
                          style={{ justifyContent: 'space-between', alignItems: isPhone ? 'stretch' : 'center' }}
                        >
                          <InlineControls
                            borderWidth={1}
                            borderColor="$borderColor"
                            px="$2"
                            py="$1.5"
                            bg="$backgroundHover"
                            style={{
                              minWidth: isPhone ? 0 : 156,
                              width: isPhone ? '100%' : undefined,
                              justifyContent: 'space-between',
                              borderRadius: 999,
                            }}
                          >
                            <SecondaryButton
                              size="$3"
                              circular
                              onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              style={{
                                width: controlSize,
                                height: controlSize,
                                minHeight: controlSize,
                                minWidth: controlSize,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                backgroundColor: baseSurfaceColor,
                                borderWidth: 1,
                                borderColor: borderToneColor,
                                borderRadius: 999,
                              }}
                            >
                              <MaterialIcons name="remove" size={18} color={textColor} />
                            </SecondaryButton>

                            <YStack
                              height={controlSize}
                              borderWidth={1}
                              borderColor="$borderColor"
                              bg="$background"
                              style={{ minWidth: controlSize + 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Text fontFamily="$mono" fontSize="$5" fontWeight="700" style={{ minWidth: 24, textAlign: 'center' }}>
                                {item.quantity}
                              </Text>
                            </YStack>

                            <SecondaryButton
                              size="$3"
                              circular
                              onPress={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                width: controlSize,
                                height: controlSize,
                                minHeight: controlSize,
                                minWidth: controlSize,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                backgroundColor: baseSurfaceColor,
                                borderWidth: 1,
                                borderColor: borderToneColor,
                                borderRadius: 999,
                              }}
                            >
                              <MaterialIcons name="add" size={18} color={textColor} />
                            </SecondaryButton>
                          </InlineControls>

                          <YStack
                            style={{
                              alignItems: 'flex-start',
                              minWidth: itemValueCardMinWidth,
                              width: isPhone ? '100%' : undefined,
                              flexShrink: 0,
                              borderWidth: 1,
                              borderColor: borderToneColor,
                              backgroundColor: surfaceColor,
                              borderRadius: 16,
                              paddingHorizontal: 14,
                              paddingVertical: 11,
                            }}
                          >
                            <YStack
                              gap="$1"
                              style={{ width: '100%', alignItems: 'center' }}
                            >
                              <Text fontSize="$3" color="$placeholderColor" fontWeight="600" style={{ textAlign: 'center' }}>
                                Wartość pozycji
                              </Text>
                              <Text
                                fontFamily="$heading"
                                fontSize={isPhone ? '$5' : '$6'}
                                fontWeight="700"
                                color={primaryColor}
                                style={{ textAlign: 'center' }}
                              >
                                {formatCurrency(item.price * item.quantity)}
                              </Text>
                            </YStack>
                          </YStack>
                        </XStack>
                      </YStack>
                    </SurfaceCard>
                  ))}
                </YStack>

                <SurfaceCard style={{ padding: summaryCardPadding, borderRadius: cardRadius + 2 }}>
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
                      style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: borderToneColor,
                        paddingHorizontal: 14,
                        paddingTop: 12,
                        paddingBottom: 12,
                        backgroundColor: surfaceColor,
                      }}
                    >
                      <DataRow>
                        <Text fontSize="$3" color="$placeholderColor" fontWeight="600">Do zapłaty</Text>
                        <Text fontFamily="$heading" fontSize="$7" fontWeight="700" color={primaryColor}>
                          {formatCurrency(totalPrice)}
                        </Text>
                      </DataRow>
                    </YStack>

                    <PrimaryButton onPress={() => { void handleCheckout() }} width="100%" style={{ minHeight: 56 }}>
                      Realizacja zamówienia
                    </PrimaryButton>

                    <ProductMetaText>
                      Produkty w koszyku nie są rezerwowane do czasu złożenia zamówienia.
                    </ProductMetaText>
                  </YStack>
                </SurfaceCard>
              </YStack>
            ) : (
              <XStack gap="$4" width="100%" style={{ minWidth: 0, alignItems: 'flex-start' }}>
                <YStack flex={1} gap="$3.5" width="100%" style={{ minWidth: 460 }}>
                  {items.map((item) => (
                    <SurfaceCard
                      key={item.id}
                      style={{
                        width: '100%',
                        padding: itemCardPadding,
                        borderRadius: cardRadius,
                      }}
                    >
                      <YStack gap="$3" width="100%" style={{ minWidth: 0 }}>
                        <XStack gap="$3" width="100%" style={{ justifyContent: 'space-between', alignItems: isTablet ? 'flex-start' : 'center' }}>
                          <XStack gap="$3" flex={1} style={{ minWidth: 0, alignItems: 'center' }}>
                            <YStack
                              width={mediaFrameSize}
                              height={mediaFrameSize}
                              borderWidth={1}
                              borderColor="$borderColor"
                              bg="$backgroundHover"
                              overflow="hidden"
                              style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                borderRadius: 18,
                                padding: 8,
                              }}
                            >
                              <YStack
                                width="100%"
                                height="100%"
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 14,
                                  overflow: 'hidden',
                                  borderWidth: 1,
                                  borderColor: borderToneColor,
                                  backgroundColor: baseSurfaceColor,
                                }}
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
                                  <Text fontFamily="$heading" fontWeight="700" fontSize="$6" color={primaryColor}>
                                    {item.name.slice(0, 1).toUpperCase()}
                                  </Text>
                                )}
                              </YStack>
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
                              <ProductMetaText fontFamily="$mono" style={{ letterSpacing: 0.5 }}>
                                Cena jednostkowa: {formatCurrency(item.price)}
                              </ProductMetaText>
                            </YStack>
                          </XStack>

                          <GhostDangerButton
                            size="$2"
                            onPress={() => removeItem(item.id)}
                            style={{
                              flexShrink: 0,
                              borderWidth: 1,
                              borderColor: '#f2b8b5',
                              backgroundColor: '#ffdad6',
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                            }}
                          >
                            Usuń
                          </GhostDangerButton>
                        </XStack>

                        <XStack gap="$3" width="100%" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <InlineControls
                            borderWidth={1}
                            borderColor="$borderColor"
                            px="$2"
                            py="$1.5"
                            bg="$backgroundHover"
                            style={{ minWidth: 172, justifyContent: 'space-between', borderRadius: 999 }}
                          >
                            <SecondaryButton
                              size="$3"
                              circular
                              onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              style={{
                                width: controlSize,
                                height: controlSize,
                                minHeight: controlSize,
                                minWidth: controlSize,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                backgroundColor: baseSurfaceColor,
                                borderWidth: 1,
                                borderColor: borderToneColor,
                                borderRadius: 999,
                              }}
                            >
                              <Text color="$color" fontFamily="$heading" fontSize="$5" lineHeight="$5" fontWeight="700">
                                -
                              </Text>
                            </SecondaryButton>
                            <YStack
                              height={controlSize}
                              borderWidth={1}
                              borderColor="$borderColor"
                              bg="$background"
                              style={{ minWidth: controlSize + 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Text fontFamily="$mono" fontSize="$5" fontWeight="700" style={{ minWidth: 24, textAlign: 'center' }}>
                                {item.quantity}
                              </Text>
                            </YStack>
                            <SecondaryButton
                              size="$3"
                              circular
                              onPress={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                width: controlSize,
                                height: controlSize,
                                minHeight: controlSize,
                                minWidth: controlSize,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                backgroundColor: baseSurfaceColor,
                                borderWidth: 1,
                                borderColor: borderToneColor,
                                borderRadius: 999,
                              }}
                            >
                              <Text color="$color" fontFamily="$heading" fontSize="$5" lineHeight="$5" fontWeight="700">
                                +
                              </Text>
                            </SecondaryButton>
                          </InlineControls>

                          <YStack
                            style={{
                              alignItems: 'flex-start',
                              minWidth: itemValueCardMinWidth,
                              width: itemValueCardMinWidth,
                              flexShrink: 0,
                              borderWidth: 1,
                              borderColor: borderToneColor,
                              backgroundColor: surfaceColor,
                              borderRadius: 16,
                              paddingHorizontal: 16,
                              paddingVertical: 11,
                            }}
                          >
                            <YStack
                              gap="$1"
                              style={{ width: '100%', alignItems: 'center' }}
                            >
                              <Text fontSize="$3" color="$placeholderColor" fontWeight="600" style={{ textAlign: 'center' }}>
                                Wartość pozycji
                              </Text>
                              <Text
                                fontFamily="$heading"
                                fontSize="$6"
                                fontWeight="700"
                                color={primaryColor}
                                style={{ textAlign: 'center' }}
                              >
                                {formatCurrency(item.price * item.quantity)}
                              </Text>
                            </YStack>
                          </YStack>
                        </XStack>
                      </YStack>
                    </SurfaceCard>
                  ))}
                </YStack>

                <YStack width={340} gap="$3" style={{ minWidth: 0, flexShrink: 0 }}>
                  <SurfaceCard style={{ padding: summaryCardPadding, borderRadius: cardRadius + 2 }}>
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
                        style={{
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: borderToneColor,
                          paddingHorizontal: 14,
                          paddingTop: 12,
                          paddingBottom: 12,
                          backgroundColor: surfaceColor,
                        }}
                      >
                        <DataRow>
                          <Text fontSize="$3" color="$placeholderColor" fontWeight="600">Do zapłaty</Text>
                          <Text fontFamily="$heading" fontSize="$7" fontWeight="700" color={primaryColor}>
                            {formatCurrency(totalPrice)}
                          </Text>
                        </DataRow>
                      </YStack>

                      <PrimaryButton onPress={() => { void handleCheckout() }} width="100%" style={{ minHeight: 56 }}>
                        Realizacja zamówienia
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
