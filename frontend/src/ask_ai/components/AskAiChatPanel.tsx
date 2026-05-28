import * as Clipboard from 'expo-clipboard'
import * as ExpoLinking from 'expo-linking'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Platform, ScrollView, useWindowDimensions } from 'react-native'
import { Button, Text, TextArea, XStack, YStack, getVariableValue, useTheme } from 'tamagui'
import type { AskAiSuggestedProductDto, AskAiTranscriptEntryDto } from '../api'
import type { AskAiChatController } from '../useAskAiChat'

type AskAiChatPanelVariant = 'modal' | 'page'

interface AskAiChatPanelProps {
  controller: AskAiChatController
  variant?: AskAiChatPanelVariant
  expanded?: boolean
  showRecommendations?: boolean
}

const MODAL_RECOMMENDATION_COLUMN_BREAKPOINT = 1500
const PHONE_FULLSCREEN_BREAKPOINT = 520

const timeFormatter = new Intl.DateTimeFormat('pl-PL', {
  hour: '2-digit',
  minute: '2-digit',
})

function formatPrice(price: number): string {
  return `${price.toFixed(2)} zł`
}

function formatMessageTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return timeFormatter.format(date)
}

function getAssistantText(entry: AskAiTranscriptEntryDto): string {
  if (entry.assistantResponse) {
    return entry.assistantResponse
  }

  if (entry.status === 'pending' || entry.status === 'running') {
    return '...'
  }

  return 'Brak odpowiedzi.'
}

function getStatusLabel(controller: AskAiChatController, isThinking: boolean): string {
  if (controller.error) {
    return 'Błąd'
  }

  if (controller.latestMessage?.status === 'session_reset') {
    return 'Sesja wygasła'
  }

  if (controller.isInitializing) {
    return 'Łączenie'
  }

  if (isThinking) {
    return 'Analiza'
  }

  return ''
}

export function AskAiChatPanel({
  controller,
  variant = 'page',
  expanded = false,
  showRecommendations = true,
}: AskAiChatPanelProps): React.JSX.Element {
  const router = useRouter()
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const transcriptScrollRef = useRef<ScrollView>(null)
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hoveredRecommendationId, setHoveredRecommendationId] = useState<number | null>(null)
  const [copiedRecommendationId, setCopiedRecommendationId] = useState<number | null>(null)
  const isModal = variant === 'modal'
  const isPhoneFullscreen = !isModal && width <= PHONE_FULLSCREEN_BREAKPOINT
  const isCompactPhone = !isModal && width <= 430
  const isCompactComposer = isCompactPhone || (isModal && width <= 860)
  const isRecommendationsEnabled = showRecommendations
  const showRecommendationColumn = isModal && isRecommendationsEnabled && expanded && width >= MODAL_RECOMMENDATION_COLUMN_BREAKPOINT
  const recommendationColumnWidth = width >= 1900 ? 320 : 292
  const isThinking = controller.isSubmitting || controller.latestMessage?.status === 'pending' || controller.latestMessage?.status === 'running'
  const isInputLocked = isThinking || controller.isInitializing
  const sendDisabled = !controller.canSubmit || isInputLocked
  const statusLabel = getStatusLabel(controller, isThinking)
  const textColor = getVariableValue(theme.color)
  const primaryColor = getVariableValue(theme.stitchPrimary)
  const placeholderColor = getVariableValue(theme.placeholderColor)
  const borderColor = getVariableValue(theme.borderColor)
  const surfaceColor = getVariableValue(theme.background)
  const hoverColor = getVariableValue(theme.backgroundHover)
  const counterColor = controller.remainingCharacters <= 250 ? '$red10' : '$placeholderColor'
  const draftCounter = `${controller.characterCount}/${controller.maxMessageLength}`
  const inputPlaceholder = isInputLocked ? 'Czekaj na odpowiedź AskAI...' : 'Napisz wiadomość...'
  const messageInputAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': 'Wiadomość do AskAI' }
    : { accessibilityLabel: 'Wiadomość do AskAI' }
  const sendButtonAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': 'Wyślij do AskAI' }
    : { accessibilityLabel: 'Wyślij do AskAI' }
  const resetButtonAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': 'Nowa sesja AskAI' }
    : { accessibilityLabel: 'Nowa sesja AskAI' }
  const shadowStyle = {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  }

  const recommendedProducts = useMemo(() => {
    const uniqueProducts = new Map<number, AskAiSuggestedProductDto>()

    controller.transcript.forEach((entry) => {
      entry.suggestedProducts.forEach((product) => {
        if (!uniqueProducts.has(product.id)) {
          uniqueProducts.set(product.id, product)
        }
      })
    })

    return Array.from(uniqueProducts.values())
  }, [controller.transcript])

  useEffect(() => {
    if (!controller.transcript.length) {
      return
    }

    transcriptScrollRef.current?.scrollToEnd({ animated: true })
  }, [controller.latestMessage?.status, controller.transcript.length])

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current)
      }
    }
  }, [])

  const statusDotColor = controller.error
    ? '#f87171'
    : isThinking
      ? primaryColor
      : controller.isInitializing
        ? '#f59e0b'
        : 'rgba(148, 163, 184, 0.7)'

  const resolveProductUrl = (productPath: string): string => {
    const normalizedPath = productPath.startsWith('/') ? productPath : `/${productPath}`

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}${normalizedPath}`
    }

    return ExpoLinking.createURL(normalizedPath)
  }

  const copyProductLink = async (product: AskAiSuggestedProductDto): Promise<void> => {
    try {
      await Clipboard.setStringAsync(resolveProductUrl(product.productPath))
      setCopiedRecommendationId(product.id)

      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current)
      }

      copyResetTimeoutRef.current = setTimeout(() => {
        setCopiedRecommendationId((current) => (current === product.id ? null : current))
      }, 1200)
    } catch {
      return
    }
  }

  const renderRecommendationCard = (product: AskAiSuggestedProductDto) => {
    const isHovered = hoveredRecommendationId === product.id
    const isCopied = copiedRecommendationId === product.id

    const card = (
      <YStack
        borderWidth={1}
        borderColor="$borderColor"
        bg={isHovered ? '$background' : '$backgroundHover'}
        p="$2.5"
        gap="$1.5"
        style={{
          borderRadius: isPhoneFullscreen ? 12 : 14,
          width: isPhoneFullscreen ? 224 : undefined,
          borderColor: isHovered ? primaryColor : borderColor,
          opacity: isHovered ? 1 : 0.96,
          ...(!isPhoneFullscreen ? shadowStyle : {}),
        }}
      >
        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            color="$color"
            fontSize="$3"
            fontWeight="700"
            numberOfLines={1}
            style={{
              flex: 1,
              minWidth: 0,
              paddingRight: 8,
              color: isHovered ? primaryColor : textColor,
            }}
          >
            {product.name}
          </Text>
          <Text color="$color" fontSize="$3" fontWeight="700" style={{ color: primaryColor }}>
            {formatPrice(product.price)}
          </Text>
        </XStack>

        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text color="$placeholderColor" fontSize="$1" fontWeight="600">
            {product.amount} szt.
          </Text>
          <MaterialIcons name="open-in-new" size={11} color={isHovered ? primaryColor : placeholderColor} />
        </XStack>
      </YStack>
    )

    const copyControlStyle = {
      position: 'absolute' as const,
      right: 8,
      bottom: 8,
      width: 24,
      height: 24,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isCopied ? primaryColor : borderColor,
      backgroundColor: isCopied ? 'rgba(34, 211, 238, 0.14)' : surfaceColor,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    }

    if (Platform.OS === 'web') {
      return (
        <YStack key={product.id} style={{ position: 'relative' }}>
          <a
            href={product.productPath}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 120ms ease, filter 120ms ease',
              transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
              filter: isHovered ? 'brightness(1.05)' : 'none',
            }}
            aria-label={product.name}
            onMouseEnter={() => setHoveredRecommendationId(product.id)}
            onMouseLeave={() => {
              setHoveredRecommendationId((current) => (current === product.id ? null : current))
            }}
          >
            {card}
          </a>

          <button
            type="button"
            aria-label={`Kopiuj link: ${product.name}`}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void copyProductLink(product)
            }}
            style={{
              ...copyControlStyle,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <MaterialIcons name={isCopied ? 'check' : 'content-copy'} size={12} color={isCopied ? primaryColor : placeholderColor} />
          </button>
        </YStack>
      )
    }

    return (
      <YStack key={product.id} style={{ position: 'relative' }}>
        <Button
          unstyled
          onPress={() => router.push(product.productPath)}
          onPressIn={() => setHoveredRecommendationId(product.id)}
          onPressOut={() => {
            setHoveredRecommendationId((current) => (current === product.id ? null : current))
          }}
        >
          {card}
        </Button>

        <Button
          unstyled
          onPress={() => {
            void copyProductLink(product)
          }}
          style={copyControlStyle}
        >
          <MaterialIcons name={isCopied ? 'check' : 'content-copy'} size={12} color={isCopied ? primaryColor : placeholderColor} />
        </Button>
      </YStack>
    )
  }

  const renderRecommendationsSection = () => {
    if (!isRecommendationsEnabled || !recommendedProducts.length) {
      return null
    }

    if (isPhoneFullscreen) {
      return (
        <YStack px="$1" style={{ minHeight: 0 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 6 }}
            keyboardShouldPersistTaps="handled"
          >
            {recommendedProducts.map(renderRecommendationCard)}
          </ScrollView>
        </YStack>
      )
    }

    return (
      <YStack
        borderWidth={1}
        borderColor="$borderColor"
        bg="$background"
        p="$2.5"
        gap="$2"
        style={{
          flex: showRecommendationColumn ? 1 : undefined,
          minHeight: showRecommendationColumn ? 0 : 128,
          borderRadius: 16,
          overflow: 'hidden',
          ...shadowStyle,
        }}
      >
        <Text color="$placeholderColor" fontSize="$1" fontWeight="700" textTransform="uppercase" letterSpacing={0.6}>
          Produkty
        </Text>

        <YStack flex={1} style={{ minHeight: 0 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            keyboardShouldPersistTaps="handled"
          >
            {recommendedProducts.map(renderRecommendationCard)}
          </ScrollView>
        </YStack>
      </YStack>
    )
  }

  const renderTranscriptEntry = (entry: AskAiTranscriptEntryDto) => {
    return (
      <YStack key={entry.messageId} gap="$2">
        <XStack style={{ justifyContent: 'flex-end' }}>
          <YStack
            borderWidth={1}
            borderColor="$borderColor"
            bg="$backgroundHover"
            p="$2.5"
            gap="$1"
            style={{
              maxWidth: isCompactPhone ? '92%' : isModal ? '86%' : '82%',
              borderRadius: 14,
              borderTopRightRadius: 8,
            }}
          >
            <Text color="$color" fontSize="$3" lineHeight="$4">
              {entry.userMessage}
            </Text>
            {formatMessageTime(entry.updatedAt) ? (
              <Text color="$placeholderColor" fontSize="$1" fontWeight="600" style={{ textAlign: 'right' }}>
                {formatMessageTime(entry.updatedAt)}
              </Text>
            ) : null}
          </YStack>
        </XStack>

        <XStack style={{ justifyContent: 'flex-start' }}>
          <YStack
            borderWidth={1}
            borderColor="$borderColor"
            bg="$background"
            p="$2.5"
            gap="$1"
            style={{
              maxWidth: '92%',
              borderRadius: 14,
              borderTopLeftRadius: 8,
            }}
          >
            <Text color="$color" fontSize="$3" lineHeight="$4">
              {getAssistantText(entry)}
            </Text>
            {formatMessageTime(entry.updatedAt) ? (
              <Text color="$placeholderColor" fontSize="$1" fontWeight="600">
                {formatMessageTime(entry.updatedAt)}
              </Text>
            ) : null}
          </YStack>
        </XStack>
      </YStack>
    )
  }

  const renderEmptyState = () => {
    const toneColor = controller.error ? '#f87171' : controller.latestMessage?.status === 'session_reset' ? '#f59e0b' : primaryColor
    const text = controller.error
      ? 'Błąd połączenia'
      : controller.latestMessage?.status === 'session_reset'
        ? 'Sesja wygasła'
        : controller.isInitializing
          ? 'Łączenie...'
          : 'Nowa rozmowa'

    return (
      <YStack flex={1} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <XStack gap="$2" style={{ alignItems: 'center' }}>
          <MaterialIcons name="auto-awesome" size={14} color={toneColor} />
          <Text color="$placeholderColor" fontSize="$2" fontWeight="600">
            {text}
          </Text>
        </XStack>
      </YStack>
    )
  }

  const renderTranscript = () => {
    return (
      <YStack
        flex={1}
        borderWidth={isPhoneFullscreen ? 0 : 1}
        borderColor="$borderColor"
        bg="$background"
        p={isPhoneFullscreen ? '$1' : '$2.5'}
        gap={isPhoneFullscreen ? '$1.5' : '$2'}
        style={{
          minHeight: isModal ? 340 : isPhoneFullscreen ? 0 : isCompactPhone ? 210 : 300,
          borderRadius: isPhoneFullscreen ? 0 : 16,
          overflow: 'hidden',
          ...(!isPhoneFullscreen ? shadowStyle : {}),
        }}
      >
        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <XStack gap="$2" style={{ alignItems: 'center' }}>
            <YStack
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                backgroundColor: statusDotColor,
              }}
            />
            {statusLabel && !isPhoneFullscreen ? (
              <Text color="$placeholderColor" fontSize="$1" fontWeight="700" textTransform="uppercase" letterSpacing={0.6}>
                {statusLabel}
              </Text>
            ) : null}
          </XStack>

          <Button
            unstyled
            {...resetButtonAccessibilityProps}
            disabled={controller.isInitializing}
            onPress={() => {
              void controller.initializeSession()
            }}
            pressStyle={{ opacity: 0.8 }}
            style={{
              width: isPhoneFullscreen ? 24 : 28,
              height: isPhoneFullscreen ? 24 : 28,
              borderRadius: 999,
              borderWidth: 1,
              borderColor,
              backgroundColor: hoverColor,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: controller.isInitializing ? 0.5 : 1,
            }}
          >
            <MaterialIcons name="restart-alt" size={isPhoneFullscreen ? 12 : 14} color={placeholderColor} />
          </Button>
        </XStack>

        {controller.transcript.length ? (
          <ScrollView
            ref={transcriptScrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
            keyboardShouldPersistTaps="handled"
          >
            {controller.transcript.map(renderTranscriptEntry)}
          </ScrollView>
        ) : (
          renderEmptyState()
        )}
      </YStack>
    )
  }

  const renderComposer = (minHeight: number) => (
    <YStack
      borderWidth={isPhoneFullscreen ? 0 : 1}
      borderColor="$borderColor"
      bg={isPhoneFullscreen ? '$background' : '$backgroundHover'}
      p={isPhoneFullscreen ? '$1' : '$2'}
      gap={isPhoneFullscreen ? '$0' : '$1.5'}
      style={{
        borderRadius: isPhoneFullscreen ? 0 : 16,
        opacity: isInputLocked ? 0.82 : 1,
        ...(!isPhoneFullscreen ? shadowStyle : {}),
      }}
    >
      <YStack style={{ position: 'relative' }}>
        <TextArea
          {...messageInputAccessibilityProps}
          value={controller.draft}
          onChangeText={(value) => {
            if (isInputLocked) {
              return
            }

            controller.setDraft(value)
          }}
          onKeyDown={(event: any) => {
            if (Platform.OS !== 'web') {
              return
            }

            if (isInputLocked) {
              event?.preventDefault?.()
              return
            }

            if (event?.key !== 'Enter' || event?.isComposing) {
              return
            }

            if (event?.ctrlKey) {
              event?.preventDefault?.()
              controller.setDraft(`${controller.draft}\n`)
              return
            }

            event?.preventDefault?.()
            if (controller.canSubmit) {
              void controller.submitMessage()
            }
          }}
          placeholder={inputPlaceholder}
          placeholderTextColor={placeholderColor}
          maxLength={controller.maxMessageLength}
          autoCorrect={false}
          autoCapitalize="sentences"
          disabled={isInputLocked}
          multiline
          borderWidth={1}
          borderColor="$borderColor"
          bg="$background"
          p={isPhoneFullscreen ? '$2' : '$2.5'}
          focusStyle={{ borderColor: '$blue10' }}
          style={{
            minHeight,
            maxHeight: isPhoneFullscreen ? 112 : 148,
            borderRadius: 12,
            color: textColor,
            fontSize: 13,
            lineHeight: 18,
            backgroundColor: isInputLocked ? hoverColor : surfaceColor,
            paddingBottom: isPhoneFullscreen ? 34 : undefined,
            paddingRight: isPhoneFullscreen ? 42 : undefined,
          }}
        />

        {isPhoneFullscreen ? (
          <XStack
            style={{
              position: 'absolute',
              left: 10,
              right: 8,
              bottom: 6,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text color={counterColor} fontSize="$1" fontWeight="700">
              {draftCounter}
            </Text>

            <Button
              unstyled
              {...sendButtonAccessibilityProps}
              disabled={sendDisabled}
              onPress={() => {
                void controller.submitMessage()
              }}
              pressStyle={{ opacity: 0.8 }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                borderWidth: 1,
                borderColor,
                backgroundColor: !sendDisabled ? surfaceColor : hoverColor,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !sendDisabled ? 1 : 0.55,
              }}
            >
              <MaterialIcons
                name={isThinking ? 'hourglass-top' : 'send'}
                size={13}
                color={!sendDisabled ? primaryColor : placeholderColor}
              />
            </Button>
          </XStack>
        ) : null}
      </YStack>

      {!isPhoneFullscreen ? (
        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text color={counterColor} fontSize="$1" fontWeight="700">
            {draftCounter}
          </Text>

          <Button
            unstyled
            {...sendButtonAccessibilityProps}
            disabled={sendDisabled}
            onPress={() => {
              void controller.submitMessage()
            }}
            pressStyle={{ opacity: 0.8 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              borderWidth: 1,
              borderColor,
              backgroundColor: !sendDisabled ? surfaceColor : hoverColor,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !sendDisabled ? 1 : 0.55,
            }}
          >
            <MaterialIcons
              name={isThinking ? 'hourglass-top' : 'send'}
              size={15}
              color={!sendDisabled ? primaryColor : placeholderColor}
            />
          </Button>
        </XStack>
      ) : null}

      {controller.error ? (
        <XStack
          borderWidth={1}
          borderColor="$red8"
          bg="$red2"
          p="$1.5"
          gap="$1"
          style={{
            alignItems: 'center',
            borderRadius: 10,
          }}
        >
          <MaterialIcons name="info-outline" size={13} color="#ef4444" />
          <Text color="$red10" fontSize="$1" fontWeight="600" style={{ flex: 1 }}>
            {controller.error}
          </Text>
        </XStack>
      ) : null}
    </YStack>
  )

  const recommendationsSection = renderRecommendationsSection()

  if (isPhoneFullscreen) {
    return (
      <YStack gap="$1" style={{ flex: 1, minHeight: 0 }}>
        {renderTranscript()}
        {recommendationsSection}
        {renderComposer(58)}
      </YStack>
    )
  }

  if (showRecommendationColumn && recommendationsSection) {
    return (
      <XStack gap="$2.5" style={{ flex: 1, minHeight: 0 }}>
        <YStack gap="$2.5" style={{ flex: 1.5, minHeight: 0 }}>
          {renderTranscript()}
          {renderComposer(84)}
        </YStack>

        <YStack width={recommendationColumnWidth} style={{ minHeight: 0 }}>
          {recommendationsSection}
        </YStack>
      </XStack>
    )
  }

  return (
    <YStack gap="$2.5" style={{ flex: 1, minHeight: 0 }}>
      {renderTranscript()}
      {renderComposer(isCompactComposer ? 70 : 78)}
      {recommendationsSection}
    </YStack>
  )
}

