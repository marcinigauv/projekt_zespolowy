import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, type Href } from 'expo-router'
import { Animated, Easing, Linking, Platform, Pressable, type LayoutChangeEvent } from 'react-native'
import { YStack, useMedia } from 'tamagui'
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

const MARQUEE_START_DELAY_MS = 1200
const MARQUEE_END_DELAY_MS = 900
const MARQUEE_RESET_DELAY_MS = 700
const MARQUEE_PIXELS_PER_SECOND = 38

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

interface NotificationsToastHostProps {
  onMobileInsetChange?: (value: number) => void
}

function NotificationMarqueeText({ message }: { message: string }) {
  const translateX = useRef(new Animated.Value(0)).current
  const [containerWidth, setContainerWidth] = useState(0)
  const [textWidth, setTextWidth] = useState(0)
  const shouldAnimate = textWidth > containerWidth && containerWidth > 0

  useEffect(() => {
    translateX.stopAnimation()
    translateX.setValue(0)

    if (!shouldAnimate) {
      return
    }

    const distance = textWidth - containerWidth
    let animationFrameId: number | null = null
    let phase: 'start-delay' | 'scrolling' | 'end-delay' | 'reset-delay' = 'start-delay'
    let phaseElapsed = 0
    let offset = 0
    let lastTimestamp: number | null = null

    const advanceFrame = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp
      }

      const delta = timestamp - lastTimestamp
      lastTimestamp = timestamp

      if (phase === 'start-delay') {
        phaseElapsed += delta

        if (phaseElapsed >= MARQUEE_START_DELAY_MS) {
          phase = 'scrolling'
          phaseElapsed = 0
        }
      } else if (phase === 'scrolling') {
        offset = Math.min(distance, offset + (MARQUEE_PIXELS_PER_SECOND * delta) / 1000)
        translateX.setValue(-offset)

        if (offset >= distance) {
          phase = 'end-delay'
          phaseElapsed = 0
        }
      } else if (phase === 'end-delay') {
        phaseElapsed += delta

        if (phaseElapsed >= MARQUEE_END_DELAY_MS) {
          phase = 'reset-delay'
          phaseElapsed = 0
          offset = 0
          translateX.setValue(0)
        }
      } else {
        phaseElapsed += delta

        if (phaseElapsed >= MARQUEE_RESET_DELAY_MS) {
          phase = 'start-delay'
          phaseElapsed = 0
        }
      }

      animationFrameId = requestAnimationFrame(advanceFrame)
    }

    animationFrameId = requestAnimationFrame(advanceFrame)

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }

      translateX.stopAnimation()
      translateX.setValue(0)
    }
  }, [containerWidth, shouldAnimate, textWidth, translateX, message])

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width
    setContainerWidth((current) => (current === nextWidth ? current : nextWidth))
  }

  const handleTextLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width
    setTextWidth((current) => (current === nextWidth ? current : nextWidth))
  }

  return (
    <YStack position="relative" width="100%">
      <ToastMarqueeViewport onLayout={handleContainerLayout}>
        <Animated.View
          style={{
            alignSelf: 'flex-start',
            transform: [{ translateX }],
          }}
        >
          <ToastText numberOfLines={1} onLayout={handleTextLayout}>{message}</ToastText>
        </Animated.View>
      </ToastMarqueeViewport>
    </YStack>
  )
}

export function NotificationsToastHost({ onMobileInsetChange }: NotificationsToastHostProps) {
  const router = useRouter()
  const media = useMedia()
  const notifications = useNotificationsStore((state) => state.notifications)
  const dismissNotification = useNotificationsStore((state) => state.dismissNotification)
  const [renderedNotification, setRenderedNotification] = useState<(typeof notifications)[number] | null>(null)
  const [hoveredNotificationId, setHoveredNotificationId] = useState<string | null>(null)
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-10)).current
  const activeNotification = useMemo(() => notifications[0] ?? null, [notifications])
  const shouldUseNativeDriver = Platform.OS !== 'web'
  const toastViewportStyle = Platform.OS === 'web'
    ? undefined
    : {
        top: media.xxs ? 8 : 12,
        left: media.xxs ? 8 : 12,
        right: media.xxs ? 8 : 12,
        alignItems: 'center' as const,
      }
  const toastCardWidth = Platform.OS === 'web' ? 360 : media.xxs ? 280 : media.xs ? 300 : 320

  useEffect(() => {
    if (Platform.OS === 'web') {
      return
    }

    if (!renderedNotification) {
      onMobileInsetChange?.(0)
    }
  }, [onMobileInsetChange, renderedNotification])

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
          toValue: -10,
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
    translateY.setValue(-10)

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

  if (!renderedNotification) {
    return null
  }

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
        style={{ opacity, transform: [{ translateY }] }}
      >
        <Pressable
          onHoverIn={Platform.OS === 'web' ? () => setHoveredNotificationId(renderedNotification.id) : undefined}
          onHoverOut={Platform.OS === 'web' ? () => setHoveredNotificationId((current) => (current === renderedNotification.id ? null : current)) : undefined}
          style={{ width: '100%', maxWidth: toastCardWidth }}
        >
          <ToastCardWrap>
            <ToastCardButton
              key={renderedNotification.id}
              style={Platform.OS === 'web' ? undefined : { maxWidth: toastCardWidth, paddingHorizontal: 12, paddingVertical: 10 }}
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
              <YStack gap="$1.5" width="100%" style={{ minWidth: 0, alignSelf: 'stretch' }}>
                <NotificationMarqueeText message={renderedNotification.message} />
              </YStack>
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