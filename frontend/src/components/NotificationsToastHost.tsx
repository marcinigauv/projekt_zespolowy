import React, { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, type Href } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { Animated, Easing, Linking, Platform, Pressable, type LayoutChangeEvent, type ViewStyle } from 'react-native'
import { XStack, YStack, getVariableValue, useMedia, useTheme } from 'tamagui'
import {
  ToastCardWrap,
  ToastCardButton,
  ToastMarqueeViewport,
  ToastText,
  ToastTooltip,
  ToastTooltipText,
  ToastViewport,
} from './styled'
import { useNotificationsStore } from '../store/notificationsStore'

const MARQUEE_PIXELS_PER_SECOND = 42

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

interface NotificationsToastHostProps {
  onMobileInsetChange?: (value: number) => void
  placement?: 'inline' | 'overlay'
}

function NotificationMarqueeText({
  message,
  hovered,
  defaultColor,
  hoverColor,
}: {
  message: string
  hovered: boolean
  defaultColor: string
  hoverColor: string
}) {
  const translateX = useRef(new Animated.Value(0)).current
  const [containerWidth, setContainerWidth] = useState(0)
  const [textWidth, setTextWidth] = useState(0)
  const isAnimatingRef = useRef(true)

  useEffect(() => {
    if (textWidth === 0 || containerWidth === 0) {
      return
    }

    isAnimatingRef.current = true
    const travelDistance = containerWidth + textWidth

    const run = () => {
      if (!isAnimatingRef.current) {
        return
      }

      translateX.setValue(containerWidth)

      Animated.timing(translateX, {
        toValue: -textWidth,
        duration: (travelDistance / MARQUEE_PIXELS_PER_SECOND) * 1000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished }) => {
        if (finished) {
          run()
        }
      })
    }

    run()

    return () => {
      isAnimatingRef.current = false
      translateX.stopAnimation()
    }
  }, [containerWidth, message, textWidth, translateX])

  const handleTextLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width
    if (nextWidth > 0) {
      setTextWidth(nextWidth)
    }
  }

  return (
    <YStack
      width="100%"
      onLayout={(event: LayoutChangeEvent) => {
        const nextWidth = event.nativeEvent.layout.width
        if (nextWidth > 0) {
          setContainerWidth(nextWidth)
        }
      }}
      style={{ minHeight: 28, alignItems: 'stretch', justifyContent: 'center' }}
    >
      <ToastMarqueeViewport
        height={28}
        width="100%"
        style={{ maxWidth: '100%', alignSelf: 'center', alignItems: 'flex-start', justifyContent: 'center' }}
      >
        <Animated.View
          style={{
            alignSelf: 'flex-start',
            transform: [{ translateX }],
          }}
        >
          <ToastText style={{ color: hovered ? hoverColor : defaultColor }} numberOfLines={1} onLayout={handleTextLayout}>
            {message}
          </ToastText>
        </Animated.View>
      </ToastMarqueeViewport>
    </YStack>
  )
}

export function NotificationsToastHost({ onMobileInsetChange, placement = 'overlay' }: NotificationsToastHostProps) {
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  const media = useMedia()
  const notifications = useNotificationsStore((state) => state.notifications)
  const dismissNotification = useNotificationsStore((state) => state.dismissNotification)
  const [renderedNotification, setRenderedNotification] = useState<(typeof notifications)[number] | null>(null)
  const [hoveredNotificationId, setHoveredNotificationId] = useState<string | null>(null)
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(10)).current
  const activeNotification = useMemo(() => notifications[0] ?? null, [notifications])
  const shouldUseNativeDriver = Platform.OS !== 'web'
  const isWeb = Platform.OS === 'web'
  const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios'
  const isNotificationsEnabledRoute = pathname === '/' || pathname.startsWith('/products/')
  const isWebPhone = isWeb && media.xs
  const isWebTablet = isWeb && !media.xs && media.md
  const isCartScreen = pathname === '/cart'
  const shouldHideToast = isWebPhone && isCartScreen
  const shouldHideToastOnNativeRoute = isNativeMobile && !isNotificationsEnabledRoute
  const isInlinePhoneToast = isWeb && isWebPhone && placement === 'inline'
  const isWebOverlayToast = isWeb && !isWebPhone && placement === 'overlay'
  const webOverlayTopInset = isWebTablet ? 62 : 66
  const overlayToastHeight = isWebOverlayToast ? 38 : undefined
  const overlayToastMinHeight = isWebOverlayToast ? 38 : 56
  const overlayToastPaddingVertical = isWebOverlayToast ? 2 : 8
  const nativeBottomInset = 18
  const primaryColor = getVariableValue(theme.stitchPrimary)
  const accentColor = getVariableValue(theme.stitchAccent)
  const primaryContainerColor = getVariableValue(theme.stitchPrimaryContainer)
  const borderAccentColor = getVariableValue(theme.stitchBorder)
  const backgroundHoverColor = getVariableValue(theme.backgroundHover)

  const toastViewportStyle: ViewStyle = {
    position: isInlinePhoneToast ? 'relative' : 'absolute',
    top: isWebOverlayToast ? webOverlayTopInset : undefined,
    bottom: isWeb ? undefined : nativeBottomInset,
    left: 0,
    right: 0,
    width: '100%',
    alignSelf: 'stretch',
    alignItems: isWebPhone ? 'stretch' : isWebTablet ? 'center' : isWeb ? 'flex-end' : 'center',
    paddingHorizontal: isWebPhone ? 12 : isWebTablet ? 18 : isWeb ? 24 : 20,
    paddingTop: isInlinePhoneToast ? 12 : 0,
    paddingBottom: isInlinePhoneToast ? 8 : isWeb ? 0 : 18,
  }

  useEffect(() => {
    if (Platform.OS === 'web') {
      return
    }

    if (!renderedNotification || shouldHideToastOnNativeRoute) {
      onMobileInsetChange?.(0)
    }
  }, [onMobileInsetChange, renderedNotification, shouldHideToastOnNativeRoute])

  useEffect(() => {
    if (!activeNotification) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 170,
          easing: Easing.out(Easing.quad),
          useNativeDriver: shouldUseNativeDriver,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 170,
          easing: Easing.out(Easing.quad),
          useNativeDriver: shouldUseNativeDriver,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setRenderedNotification(null)
        }
      })
      return
    }

    setHoveredNotificationId(null)

    setRenderedNotification((current) => {
      if (current?.id === activeNotification.id) {
        return current
      }

      return activeNotification
    })

    opacity.setValue(0)
    translateY.setValue(10)

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
    ]).start()
  }, [activeNotification, opacity, shouldUseNativeDriver, translateY])

  if (placement === 'inline' && !isInlinePhoneToast) {
    return null
  }

  if (placement === 'overlay' && isWeb && isWebPhone) {
    return null
  }

  if (shouldHideToast) {
    return null
  }

  if (shouldHideToastOnNativeRoute) {
    return null
  }

  if (!renderedNotification) {
    return null
  }

  const isToastHovered = Platform.OS === 'web' && hoveredNotificationId === renderedNotification.id

  return (
    <ToastViewport style={toastViewportStyle}>
      <Animated.View
        onLayout={(event) => {
          if (Platform.OS === 'web') {
            return
          }

          const reservedInset = event.nativeEvent.layout.height + (media.xxs ? 16 : 24)
          onMobileInsetChange?.(reservedInset)
        }}
        style={{
          opacity,
          transform: [{ translateY }],
          width: '100%',
          maxWidth: isInlinePhoneToast ? undefined : isWebTablet ? 560 : isWeb ? 420 : 1040,
          alignSelf: isWebOverlayToast ? (isWebTablet ? 'center' : 'flex-end') : 'center',
        }}
      >
        <Pressable
          onHoverIn={Platform.OS === 'web' ? () => setHoveredNotificationId(renderedNotification.id) : undefined}
          onHoverOut={Platform.OS === 'web' ? () => setHoveredNotificationId((current) => (current === renderedNotification.id ? null : current)) : undefined}
          style={{ width: '100%', alignItems: 'stretch' }}
        >
          <ToastCardWrap style={{ width: '100%', alignItems: 'stretch' }}>
            <ToastCardButton
              key={renderedNotification.id}
                flexDirection="row"
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: overlayToastPaddingVertical,
                  width: '100%',
                  height: overlayToastHeight,
                  minHeight: overlayToastMinHeight,
                  alignItems: 'center',
                }}
              onPress={() => {
                dismissNotification(renderedNotification.id)

                if (!renderedNotification.url) {
                  return
                }

                if (isExternalUrl(renderedNotification.url)) {
                  void Linking.openURL(renderedNotification.url)
                  return
                }

                router.push(renderedNotification.url as Href)
              }}
            >
              <XStack gap="$2.5" width="100%" style={{ minWidth: 0, alignItems: 'center' }}>
                <YStack
                  width={24}
                  height={24}
                  style={{
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isToastHovered ? primaryContainerColor : backgroundHoverColor,
                    borderWidth: 1,
                    borderColor: isToastHovered ? accentColor : borderAccentColor,
                  }}
                >
                  <Feather
                    name="bell"
                    size={14}
                    color={isToastHovered ? accentColor : primaryColor}
                  />
                </YStack>

                <YStack flex={1} width="100%" style={{ minWidth: 0, justifyContent: 'center' }}>
                  <NotificationMarqueeText
                    message={renderedNotification.message}
                    hovered={isToastHovered}
                    defaultColor={primaryColor}
                    hoverColor={accentColor}
                  />
                </YStack>

                <YStack
                  width={24}
                  height={24}
                  style={{
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isToastHovered ? primaryContainerColor : backgroundHoverColor,
                  }}
                >
                  <Feather
                    name={renderedNotification.url ? 'arrow-up-right' : 'info'}
                    size={14}
                    color={isToastHovered ? accentColor : primaryColor}
                  />
                </YStack>
              </XStack>
            </ToastCardButton>

            {Platform.OS === 'web' && hoveredNotificationId === renderedNotification.id ? (
              <ToastTooltip>
                <ToastTooltipText>{renderedNotification.message}</ToastTooltipText>
              </ToastTooltip>
            ) : null}
          </ToastCardWrap>
        </Pressable>
      </Animated.View>
    </ToastViewport>
  )
}