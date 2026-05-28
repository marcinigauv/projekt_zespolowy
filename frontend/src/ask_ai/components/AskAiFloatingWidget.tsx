import { MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Platform, useWindowDimensions } from 'react-native'
import { Button, Text, XStack, YStack, getVariableValue, useTheme } from 'tamagui'
import { useAuthStore } from '../../store/authStore'
import { AskAiChatPanel } from '../components/AskAiChatPanel'
import { useAskAiChat } from '../useAskAiChat'

const PHONE_BREAKPOINT = 520

export function AskAiFloatingWidget() {
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const resolvedViewportWidth = width
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(resolvedViewportWidth > 1440)
  const didAttemptAutoInitializeRef = useRef(false)
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const panelTranslateX = useRef(new Animated.Value(36)).current
  const panelScale = useRef(new Animated.Value(0.98)).current
  const shouldUseNativeDriver = Platform.OS !== 'web'
  const launcherLabel = isOpen ? 'Zamknij AskAI' : 'Otwórz AskAI'
  const expandLabel = isExpanded ? 'Zmniejsz panel AskAI' : 'Rozszerz panel AskAI'
  const closeLabel = 'Zamknij AskAI'
  const overlayCloseLabel = 'Zamknij panel AskAI'
  const launcherAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': launcherLabel }
    : { accessibilityLabel: launcherLabel }
  const expandAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': expandLabel }
    : { accessibilityLabel: expandLabel }
  const closeAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': closeLabel }
    : { accessibilityLabel: closeLabel }
  const overlayAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': overlayCloseLabel }
    : { accessibilityLabel: overlayCloseLabel }
  const controller = useAskAiChat({
    enabled: isAuthenticated,
    autoInitialize: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (resolvedViewportWidth <= 1320 && isExpanded) {
      setIsExpanded(false)
    }
  }, [isExpanded, resolvedViewportWidth])

  useEffect(() => {
    if (!isOpen || !isAuthenticated) {
      didAttemptAutoInitializeRef.current = false
      return
    }

    if (controller.sessionId || controller.isInitializing || didAttemptAutoInitializeRef.current) {
      return
    }

    didAttemptAutoInitializeRef.current = true
    void controller.initializeSession()
  }, [controller.initializeSession, controller.isInitializing, controller.sessionId, isAuthenticated, isOpen])

  useEffect(() => {
    if (Platform.OS !== 'web' || !isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (isOpen) {
        setIsMounted(true)
        overlayOpacity.setValue(1)
        panelTranslateX.setValue(0)
        panelScale.setValue(1)
        return
      }

      overlayOpacity.setValue(0)
      panelTranslateX.setValue(28)
      panelScale.setValue(0.98)
      setIsMounted(false)
      return
    }

    if (isOpen) {
      setIsMounted(true)
      overlayOpacity.setValue(0)
      panelTranslateX.setValue(36)
      panelScale.setValue(0.98)

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: shouldUseNativeDriver,
        }),
        Animated.timing(panelTranslateX, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: shouldUseNativeDriver,
        }),
        Animated.timing(panelScale, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: shouldUseNativeDriver,
        }),
      ]).start()
      return
    }

    if (!isMounted) {
      return
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: shouldUseNativeDriver,
      }),
      Animated.timing(panelTranslateX, {
        toValue: 28,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: shouldUseNativeDriver,
      }),
      Animated.timing(panelScale, {
        toValue: 0.98,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: shouldUseNativeDriver,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsMounted(false)
      }
    })
  }, [isMounted, isOpen, overlayOpacity, panelScale, panelTranslateX, shouldUseNativeDriver])

  const shouldRenderPanel = Platform.OS === 'web' ? isOpen : isMounted

  if (!isAuthResolved || !isAuthenticated || resolvedViewportWidth <= PHONE_BREAKPOINT) {
    return null
  }

  const surfaceColor = getVariableValue(theme.background)
  const softSurfaceColor = getVariableValue(theme.backgroundHover)
  const primaryColor = getVariableValue(theme.stitchPrimary)
  const placeholderColor = getVariableValue(theme.placeholderColor)
  const onPrimaryColor = getVariableValue(theme.stitchOnPrimary)
  const launcherSize = 44
  const launcherRightOffset = resolvedViewportWidth > 1280 ? 14 : 10
  const launcherBottomOffset = resolvedViewportWidth > 768 ? 14 : 10
  const panelRightOffset = resolvedViewportWidth > 1280 ? 14 : 10
  const panelTopOffset = resolvedViewportWidth > 1024 ? 110 : 102
  const panelBottomOffset = 10
  const collapsedPanelWidth = resolvedViewportWidth > 1500 ? 420 : resolvedViewportWidth > 1200 ? 400 : 368
  const expandedPanelWidth = resolvedViewportWidth > 1600 ? 620 : resolvedViewportWidth > 1320 ? 560 : 520
  const panelWidth = Math.min(
    isExpanded ? expandedPanelWidth : collapsedPanelWidth,
    Math.max(resolvedViewportWidth - 20, 340),
  )
  const fixedPosition = 'fixed' as const
  const shadowStyle = {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  }

  const overlayLayer = (
    <YStack
      style={{
        position: fixedPosition,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 22,
      }}
    >
      <Button
        unstyled
        {...overlayAccessibilityProps}
        onPress={() => setIsOpen(false)}
        style={{
          position: fixedPosition,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(10, 14, 22, 0.2)',
        }}
      />
    </YStack>
  )

  const panelLayer = (
    <YStack
      style={{
        position: fixedPosition,
        top: panelTopOffset,
        right: panelRightOffset,
        bottom: panelBottomOffset,
        width: panelWidth,
        zIndex: 24,
      }}
    >
      <YStack
        borderWidth={1}
        borderColor="$borderColor"
        bg="$background"
        p="$3"
        gap="$2"
        style={{
          flex: 1,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: surfaceColor,
          ...shadowStyle,
        }}
      >
        <XStack gap="$2" flexWrap="wrap" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <XStack gap="$2" style={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
            <YStack
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: primaryColor,
              }}
            />
            <Text color="$color" fontFamily="$heading" fontSize="$4" fontWeight="700" numberOfLines={1}>
              AskAI
            </Text>
          </XStack>

          <XStack gap="$2" flexWrap="wrap" style={{ alignItems: 'center' }}>
            <Button
              unstyled
              {...expandAccessibilityProps}
              onPress={() => setIsExpanded((current) => !current)}
              pressStyle={{ opacity: 0.85 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: getVariableValue(theme.borderColor),
                backgroundColor: softSurfaceColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons
                name={isExpanded ? 'close-fullscreen' : 'open-in-full'}
                size={14}
                color={placeholderColor}
              />
            </Button>

            <Button
              unstyled
              {...closeAccessibilityProps}
              onPress={() => setIsOpen(false)}
              pressStyle={{ opacity: 0.85 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: getVariableValue(theme.borderColor),
                backgroundColor: softSurfaceColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="close" size={16} color={placeholderColor} />
            </Button>
          </XStack>
        </XStack>

        <YStack flex={1} style={{ minHeight: 0 }}>
          <AskAiChatPanel controller={controller} variant="modal" expanded={isExpanded} />
        </YStack>
      </YStack>
    </YStack>
  )

  return (
    <>
      <YStack
        style={{
          position: fixedPosition,
          right: launcherRightOffset,
          bottom: launcherBottomOffset,
          zIndex: 24,
        }}
      >
        <Button
          unstyled
          {...launcherAccessibilityProps}
          onPress={() => setIsOpen((current) => !current)}
          pressStyle={{ opacity: 0.92 }}
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: getVariableValue(theme.borderColor),
            backgroundColor: softSurfaceColor,
            width: launcherSize,
            height: launcherSize,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadowStyle,
          }}
        >
          <YStack
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: primaryColor,
            }}
          >
            <MaterialIcons name="auto-awesome" size={14} color={onPrimaryColor} />
          </YStack>
        </Button>
      </YStack>

      {shouldRenderPanel ? Platform.OS === 'web' ? (
        panelLayer
      ) : (
        <>
          <Animated.View style={{ opacity: overlayOpacity }}>
            {overlayLayer}
          </Animated.View>

          <Animated.View
            style={{
              opacity: overlayOpacity,
              transform: [{ translateX: panelTranslateX }, { scale: panelScale }],
            }}
          >
            {panelLayer}
          </Animated.View>
        </>
      ) : null}
    </>
  )
}
