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

const MARQUEE_PIXELS_PER_SECOND = 38

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

interface NotificationsToastHostProps {
  onMobileInsetChange?: (value: number) => void
}

/* function NotificationMarqueeText({ message }: { message: string }) {
  const translateX = useRef(new Animated.Value(0)).current
  const [containerWidth, setContainerWidth] = useState(0)
  const [textWidth, setTextWidth] = useState(0)

  useEffect(() => {
    // Czekamy, aż system prawidłowo zmierzy pełną szerokość paska i tekstu
    if (containerWidth === 0 || textWidth === 0) {
      return
    }

    // Ustawiamy tekst na samym początku paska (po prawej stronie poza ekranem)
    translateX.setValue(containerWidth)

    // Tworzymy płynną, nieskończoną pętlę przesuwania od prawej do lewej
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -textWidth, // Jedzie aż cały tekst schowa się za lewą krawędzią
        duration: ((containerWidth + textWidth) / MARQUEE_PIXELS_PER_SECOND) * 1000, 
        easing: Easing.linear, // Płynny, jednostajny ruch
        useNativeDriver: Platform.OS !== 'web',
      })
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [containerWidth, textWidth, message, translateX])

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width
    if (nextWidth > 0) {
      setContainerWidth(nextWidth)
    }
  }

  const handleTextLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width
    if (nextWidth > 0) {
      setTextWidth(nextWidth)
    }
  }

  return (
    <YStack position="relative" width="100%" height={24} style={{ alignSelf: 'stretch' }}>
      <ToastMarqueeViewport onLayout={handleContainerLayout} style={{ height: 24, width: '100%', alignSelf: 'stretch' }}>
        <Animated.View
          style={{
            position: 'absolute', 
            left: 0,
            top: 0,
            transform: [{ translateX }],
          }}
        >
          <ToastText 
            numberOfLines={1} 
            onLayout={handleTextLayout}
            color="white" 
            fontWeight="700"
          >
            {message}
          </ToastText>
        </Animated.View>
      </ToastMarqueeViewport>
    </YStack>
  )
} */
/* function NotificationMarqueeText({ message }: { message: string }) {
  const translateX = useRef(new Animated.Value(0)).current
  const [containerWidth, setContainerWidth] = useState(0)
  const [textWidth, setTextWidth] = useState(0)

  useEffect(() => {
    if (containerWidth === 0 || textWidth === 0) {
      return
    }

    translateX.setValue(containerWidth)

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -textWidth, 
        duration: ((containerWidth + textWidth) / MARQUEE_PIXELS_PER_SECOND) * 1000, 
        easing: Easing.linear, 
        useNativeDriver: Platform.OS !== 'web',
      })
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [containerWidth, textWidth, message, translateX])

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width
    if (nextWidth > 0) {
      setContainerWidth(nextWidth)
    }
  }

  const handleTextLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width
    if (nextWidth > 0) {
      setTextWidth(nextWidth)
    }
  }

  return (
    // Dodajemy alignItems="center", aby wewnętrzne okienko było idealnie na środku
    <YStack position="relative" width="100%" height={24} alignItems="center">
      <ToastMarqueeViewport 
        onLayout={handleContainerLayout} 
        style={{ 
          height: 24, 
          // KLUCZOWE: Na webie ograniczamy szerokość okienka (np. do 600px), na mobile dajemy 100%
          width: Platform.OS === 'web' ? 600 : '100%', 
          maxWidth: '100%', // Zabezpieczenie dla mniejszych okien przeglądarki
          alignSelf: 'center' 
        }}
      >
        <Animated.View
          style={{
            position: 'absolute', 
            right: 0,
            top: 0,
            transform: [{ translateX }],
          }}
        >
          <ToastText 
            numberOfLines={1} 
            onLayout={handleTextLayout}
            color="white" 
            fontWeight="700"
          >
            {message}
          </ToastText>
        </Animated.View>
      </ToastMarqueeViewport>
    </YStack>
  )
} */
function NotificationMarqueeText({ message }: { message: string }) {
  const translateX = useRef(new Animated.Value(0)).current
  const [textWidth, setTextWidth] = useState(0)
  const isAnimating = useRef(true)
  
  // Odstęp (w pikselach) między powtórzeniami tekstu na pasku
  const gap = 60 

  useEffect(() => {
    if (textWidth === 0) {
      return
    }

    isAnimating.current = true

    const startAnimation = () => {
      if (!isAnimating.current) return

      // Zawsze zaczynamy od pozycji 0
      translateX.setValue(0)

      // Przesuwamy w lewo dokładnie o długość JEDNEGO tekstu wraz z odstępem
      Animated.timing(translateX, {
        toValue: -(textWidth + gap),
        duration: ((textWidth + gap) / MARQUEE_PIXELS_PER_SECOND) * 1000,
        easing: Easing.linear, // Jednostajny, płynny ruch
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished }) => {
        // Gdy dojedzie do końca, natychmiastowo i niezauważalnie resetujemy do 0 i zapętlamy
        if (finished) {
          startAnimation()
        }
      })
    }

    startAnimation()

    return () => {
      isAnimating.current = false
      translateX.stopAnimation()
    }
  }, [textWidth, message, translateX])

  const handleTextLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width
    if (nextWidth > 0) {
      setTextWidth(nextWidth)
    }
  }

  return (
    <YStack width="100%" height={24} alignItems="center" justifyContent="center">
      <ToastMarqueeViewport 
        height={24}
        width={Platform.OS === 'web' ? 600 : '100%'} 
        maxWidth="100%" 
        alignSelf="center"
      >
        <Animated.View
          style={{
            position: 'absolute', 
            right: 0,
            top: 0,
            flexDirection: 'row', // KLUCZOWE: Układamy kopie tekstów obok siebie w jednej linii
            transform: [{ translateX }],
          }}
        >
          {/* KOPIA 1: Tę kopię mierzymy, żeby poznać szerokość napisu */}
          <ToastText 
            numberOfLines={1} 
            onLayout={handleTextLayout}
            color="white" 
            fontWeight="700"
            style={{ marginRight: gap }}
          >
            {message}
          </ToastText>

          {/* KOPIA 2: Tworzy efekt ciągłości, gdy pierwsza kopia schodzi z ekranu */}
          <ToastText 
            numberOfLines={1} 
            color="white" 
            fontWeight="700"
            style={{ marginRight: gap }}
          >
            {message}
          </ToastText>

          {/* KOPIA 3: Zabezpieczenie na wypadek bardzo szerokich ekranów lub krótkich tekstów */}
          <ToastText 
            numberOfLines={1} 
            color="white" 
            fontWeight="700"
          >
            {message}
          </ToastText>
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
  const translateY = useRef(new Animated.Value(10)).current 
  const activeNotification = useMemo(() => notifications[0] ?? null, [notifications])
  const shouldUseNativeDriver = Platform.OS !== 'web'
  
  // POPRAWIONE: Stały styl pozycjonowania na dole ekranu i rozciągania (stretch) dla Web i Mobile
  const toastViewportStyle = {
    bottom: 0, 
    left: 0,
    right: 0,
    alignItems: 'stretch' as const, 
  }

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
        style={{ opacity, transform: [{ translateY }], width: '100%' }} 
      >
        <Pressable
          onHoverIn={Platform.OS === 'web' ? () => setHoveredNotificationId(renderedNotification.id) : undefined}
          onHoverOut={Platform.OS === 'web' ? () => setHoveredNotificationId((current) => (current === renderedNotification.id ? null : current)) : undefined}
          style={{ width: '100%', alignItems: 'stretch' }}
        >
          <ToastCardWrap style={{ width: '100%', alignItems: 'stretch' }}>
            <ToastCardButton
              key={renderedNotification.id}
              flexDirection="column" // KLUCZOWE: Wymuszenie układu kolumnowego zamiast wiersza
              alignItems="stretch"   // KLUCZOWE: Zmuszenie dzieci do rozciągnięcia się na 100% szerokości paska
              style={{ paddingHorizontal: 12, paddingVertical: 10, width: '100%' }}
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