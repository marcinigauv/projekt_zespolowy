import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, type Href } from 'expo-router'
import { Animated, Easing, Linking } from 'react-native'
import { YStack } from 'tamagui'
import {
  ToastCardButton,
  ToastMetaText,
  ToastText,
  ToastViewport,
} from './styled'
import { useNotificationsStore } from '../store/notificationsStore'

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function NotificationsToastHost() {
  const router = useRouter()
  const notifications = useNotificationsStore((state) => state.notifications)
  const dismissNotification = useNotificationsStore((state) => state.dismissNotification)
  const [renderedNotification, setRenderedNotification] = useState<(typeof notifications)[number] | null>(null)
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-10)).current
  const activeNotification = useMemo(() => notifications[0] ?? null, [notifications])

  useEffect(() => {
    if (!activeNotification) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 170,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 170,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setRenderedNotification(null)
        }
      })
      return
    }

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
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [activeNotification, opacity, translateY])

  if (!renderedNotification) {
    return null
  }

  return (
    <ToastViewport>
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <ToastCardButton
          key={renderedNotification.id}
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
          <YStack gap="$1.5">
            <ToastText>{renderedNotification.message}</ToastText>
          </YStack>
        </ToastCardButton>
      </Animated.View>
    </ToastViewport>
  )
}