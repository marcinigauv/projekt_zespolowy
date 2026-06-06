import * as Clipboard from 'expo-clipboard'
import * as ExpoLinking from 'expo-linking'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform, ScrollView, useWindowDimensions } from 'react-native'
import { Button, Text, TextArea, XStack, YStack, getVariableValue, useTheme } from 'tamagui'
import type { AskAiSuggestedProductDto, AskAiTranscriptEntryDto } from '../api'
import { usePolishSpeechToText } from '../usePolishSpeechToText'
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

function mergeDraftWithDictation(currentDraft: string, dictatedText: string): string {
  const sanitizedDictation = dictatedText.trim()

  if (!sanitizedDictation) {
    return currentDraft
  }

  if (!currentDraft) {
    return sanitizedDictation
  }

  const needsSeparator = !/[\s\n]$/u.test(currentDraft)
  return `${currentDraft}${needsSeparator ? ' ' : ''}${sanitizedDictation}`
}

function clampDraftToLimit(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

function stabilizeSpeechTranscript(previousTranscript: string, nextTranscript: string): string {
  const previous = previousTranscript.trim()
  const incoming = nextTranscript.trim()

  if (!incoming) {
    return previous
  }

  if (!previous) {
    return incoming
  }

  if (incoming === previous) {
    return previous
  }

  if (incoming.startsWith(previous)) {
    return incoming
  }

  if (previous.startsWith(incoming)) {
    return previous
  }

  let normalizedIncoming = incoming
  const duplicatedPrefix = `${previous} ${previous}`
  while (normalizedIncoming.startsWith(duplicatedPrefix)) {
    normalizedIncoming = `${previous}${normalizedIncoming.slice(duplicatedPrefix.length)}`.trim()
  }

  if (normalizedIncoming.startsWith(previous)) {
    return normalizedIncoming
  }

  const maxOverlap = Math.min(previous.length, normalizedIncoming.length)
  for (let overlapLength = maxOverlap; overlapLength >= 8; overlapLength -= 1) {
    if (previous.slice(-overlapLength) === normalizedIncoming.slice(0, overlapLength)) {
      return `${previous}${normalizedIncoming.slice(overlapLength)}`.trim()
    }
  }

  return normalizedIncoming
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
  const draftRef = useRef(controller.draft)
  const speechDraftBaseRef = useRef<string | null>(null)
  const speechTranscriptRef = useRef('')
  const speechStoppedByLimitRef = useRef(false)
  const wasSpeechActiveRef = useRef(false)
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hoveredRecommendationId, setHoveredRecommendationId] = useState<number | null>(null)
  const [copiedRecommendationId, setCopiedRecommendationId] = useState<number | null>(null)
  const [speechWaveTick, setSpeechWaveTick] = useState(0)
  const isModal = variant === 'modal'
  const isPhoneFullscreen = !isModal && width <= PHONE_FULLSCREEN_BREAKPOINT
  const isCompactPhone = !isModal && width <= 430
  const isCompactComposer = isCompactPhone || (isModal && width <= 860)
  const isRecommendationsEnabled = showRecommendations
  const showRecommendationColumn = isModal && isRecommendationsEnabled && expanded && width >= MODAL_RECOMMENDATION_COLUMN_BREAKPOINT
  const recommendationColumnWidth = width >= 1900 ? 320 : 292
  const isThinking = controller.isSubmitting || controller.latestMessage?.status === 'pending' || controller.latestMessage?.status === 'running'
  const isAiBusy = isThinking || controller.isInitializing
  const statusLabel = getStatusLabel(controller, isThinking)
  const textColor = getVariableValue(theme.color)
  const primaryColor = getVariableValue(theme.stitchPrimary)
  const placeholderColor = getVariableValue(theme.placeholderColor)
  const borderColor = getVariableValue(theme.borderColor)
  const surfaceColor = getVariableValue(theme.background)
  const hoverColor = getVariableValue(theme.backgroundHover)
  const counterColor = controller.remainingCharacters <= 250 ? '$red10' : '$placeholderColor'
  const draftCounter = `${controller.characterCount}/${controller.maxMessageLength}`
  const micNeutralColor = '#94a3b8'
  const micActiveColor = '#ef4444'
  const speechInputBg = '#0f172a'
  const speechInputTextColor = '#f8fafc'

  const applySpeechTranscript = useCallback((dictatedText: string) => {
    const stabilizedTranscript = stabilizeSpeechTranscript(speechTranscriptRef.current, dictatedText)

    if (!stabilizedTranscript) {
      return
    }

    speechTranscriptRef.current = stabilizedTranscript
    const draftBase = speechDraftBaseRef.current ?? draftRef.current
    const mergedDraft = mergeDraftWithDictation(draftBase, stabilizedTranscript)
    const nextDraft = clampDraftToLimit(mergedDraft, controller.maxMessageLength)

    if (nextDraft === draftRef.current) {
      return
    }

    draftRef.current = nextDraft
    controller.setDraft(nextDraft)
  }, [controller.maxMessageLength, controller.setDraft])

  const ignoreSpeechFinal = useCallback(() => {
    return
  }, [])

  const speechToText = usePolishSpeechToText({
    enabled: !isAiBusy,
    onFinalText: ignoreSpeechFinal,
  })

  const speechActive = speechToText.isListening || speechToText.isStarting
  const isInputLocked = isAiBusy || speechActive
  const sendDisabled = !controller.canSubmit || isInputLocked
  const speechButtonDisabled = !speechToText.isSupported || (isAiBusy && !speechActive)
  const inputPlaceholder = isAiBusy
    ? 'Czekaj na odpowiedź AskAI...'
    : speechActive
      ? ''
      : 'Napisz wiadomość...'
  const speechOverlayMessage = speechActive ? 'Słucham... mów teraz.' : ''
  const speechButtonLabel = speechActive ? 'Zatrzymaj dyktowanie' : 'Rozpocznij dyktowanie'
  const speechFieldBorderColor = speechToText.errorMessage
    ? '#ef4444'
    : speechActive
      ? '#f43f5e'
      : '#334155'
  const micPulseScale = speechActive ? 1 + (0.06 * Math.sin(speechWaveTick * 0.55)) : 1

  const speechWaveBars = useMemo(() => {
    if (!speechActive) {
      return []
    }

    const barsCount = isPhoneFullscreen ? 16 : 22
    const amplitude = Math.max(0.08, speechToText.audioLevel)
    const minHeight = 4
    const maxHeight = isPhoneFullscreen ? 20 : 24

    return Array.from({ length: barsCount }, (_, index) => {
      const phase = (speechWaveTick * 0.45) + (index * 0.62)
      const oscillation = (Math.sin(phase) + 1) / 2
      const height = minHeight + ((0.22 + (oscillation * 0.78)) * amplitude * maxHeight)
      return Math.max(minHeight, Math.min(maxHeight + minHeight, height))
    })
  }, [isPhoneFullscreen, speechActive, speechToText.audioLevel, speechWaveTick])

  const messageInputAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': 'Wiadomość do AskAI' }
    : { accessibilityLabel: 'Wiadomość do AskAI' }
  const sendButtonAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': 'Wyślij do AskAI' }
    : { accessibilityLabel: 'Wyślij do AskAI' }
  const resetButtonAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': 'Nowa sesja AskAI' }
    : { accessibilityLabel: 'Nowa sesja AskAI' }
  const speechButtonAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': speechButtonLabel }
    : { accessibilityLabel: speechButtonLabel }
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
    draftRef.current = controller.draft
  }, [controller.draft])

  useEffect(() => {
    if (speechActive && !wasSpeechActiveRef.current) {
      speechDraftBaseRef.current = draftRef.current
      speechTranscriptRef.current = ''
      speechStoppedByLimitRef.current = false
    }

    if (!speechActive && wasSpeechActiveRef.current) {
      speechDraftBaseRef.current = null
      speechTranscriptRef.current = ''
      speechStoppedByLimitRef.current = false
    }

    wasSpeechActiveRef.current = speechActive
  }, [speechActive])

  useEffect(() => {
    if (!speechActive) {
      return
    }

    applySpeechTranscript(speechToText.interimTranscript)
  }, [applySpeechTranscript, speechActive, speechToText.interimTranscript])

  useEffect(() => {
    if (!speechActive) {
      return
    }

    if (controller.characterCount < controller.maxMessageLength) {
      return
    }

    if (speechStoppedByLimitRef.current) {
      return
    }

    speechStoppedByLimitRef.current = true
    speechToText.stopListening()
  }, [controller.characterCount, controller.maxMessageLength, speechActive, speechToText])

  useEffect(() => {
    if (!speechActive) {
      setSpeechWaveTick(0)
      return
    }

    const intervalId = setInterval(() => {
      setSpeechWaveTick((current) => current + 1)
    }, 95)

    return () => {
      clearInterval(intervalId)
    }
  }, [speechActive])

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

  const copyTextWithFallback = async (value: string): Promise<boolean> => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        await window.navigator.clipboard.writeText(value)
        return true
      } catch {
        // Fallback below.
      }

      if (typeof document !== 'undefined') {
        try {
          const textArea = document.createElement('textarea')
          textArea.value = value
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          textArea.style.pointerEvents = 'none'
          textArea.style.top = '0'
          textArea.style.left = '0'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()

          const copied = document.execCommand('copy')
          document.body.removeChild(textArea)

          if (copied) {
            return true
          }
        } catch {
          // Expo clipboard fallback below.
        }
      }
    }

    try {
      await Clipboard.setStringAsync(value)
      return true
    } catch {
      return false
    }
  }

  const copyProductLink = async (product: AskAiSuggestedProductDto): Promise<void> => {
    setCopiedRecommendationId(product.id)

    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current)
    }

    copyResetTimeoutRef.current = setTimeout(() => {
      setCopiedRecommendationId((current) => (current === product.id ? null : current))
    }, 2200)

    await copyTextWithFallback(resolveProductUrl(product.productPath))
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

    const copyFeedback = isCopied ? (
      <YStack
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 38,
          bottom: 7,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: borderColor,
          backgroundColor: surfaceColor,
          paddingHorizontal: 8,
          paddingVertical: 3,
          opacity: 0.98,
        }}
      >
        <Text color="$color" fontSize="$1" fontWeight="700" numberOfLines={1}>
          Skopiowano do schowka
        </Text>
      </YStack>
    ) : null

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

          {copyFeedback}
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

        {copyFeedback}
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
      <YStack flex={1} style={{ alignItems: 'center', justifyContent: isPhoneFullscreen ? 'flex-start' : 'center', paddingTop: isPhoneFullscreen ? 40 : 0 }}>
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

  const renderComposer = (minHeight: number) => {
    const basePaddingY = isPhoneFullscreen ? 8 : 10
    const inactiveBottomPadding = isPhoneFullscreen ? 34 : basePaddingY
    const activeBottomPadding = isPhoneFullscreen ? 58 : 48

    return (
    <YStack
      borderWidth={isPhoneFullscreen ? 0 : 1}
      borderColor="$borderColor"
      bg={isPhoneFullscreen ? '$background' : '$backgroundHover'}
      p={isPhoneFullscreen ? '$1' : '$2'}
      gap={isPhoneFullscreen ? '$0' : '$1.5'}
      style={{
        borderRadius: isPhoneFullscreen ? 0 : 16,
        opacity: isAiBusy ? 0.82 : 1,
        marginBottom: isPhoneFullscreen ? 14 : 0,
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

            const nextDraft = clampDraftToLimit(value, controller.maxMessageLength)
            draftRef.current = nextDraft
            controller.setDraft(nextDraft)
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
          placeholderTextColor={speechActive ? '$color10' : '$placeholderColor'}
          maxLength={controller.maxMessageLength}
          autoCorrect={false}
          autoCapitalize="sentences"
          disabled={isInputLocked}
          multiline
          borderWidth={1}
          borderColor="$borderColor"
          bg="$background"
          p={isPhoneFullscreen ? '$2' : '$2.5'}
          focusStyle={{ borderColor: speechActive ? '#f43f5e' : '#60a5fa' }}
          style={{
            minHeight,
            maxHeight: isPhoneFullscreen ? 112 : 148,
            borderRadius: 12,
            color: speechInputTextColor,
            fontSize: 13,
            lineHeight: 18,
            backgroundColor: speechInputBg,
            borderColor: speechFieldBorderColor,
            paddingTop: speechActive ? 34 : basePaddingY,
            paddingBottom: speechActive ? activeBottomPadding : inactiveBottomPadding,
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

            <XStack gap="$1.5" style={{ alignItems: 'center' }}>
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
          </XStack>
        ) : null}

        {speechOverlayMessage ? (
          <XStack
            pointerEvents="none"
            borderWidth={1}
            borderColor="#334155"
            bg="rgba(15, 23, 42, 0.94)"
            px="$2"
            py="$1"
            gap="$1"
            style={{
              position: 'absolute',
              left: isPhoneFullscreen ? 10 : 12,
              right: isPhoneFullscreen ? 10 : 12,
              top: 8,
              borderRadius: 10,
              alignItems: 'center',
              opacity: 0.96,
            }}
          >
            <MaterialIcons name="graphic-eq" size={13} color={micActiveColor} />
            <Text color="#e2e8f0" fontSize="$1" fontWeight="700" numberOfLines={1} style={{ flex: 1 }}>
              {speechOverlayMessage}
            </Text>
          </XStack>
        ) : null}

        {speechActive ? (
          <XStack
            pointerEvents="none"
            gap={4}
            style={{
              position: 'absolute',
              left: isPhoneFullscreen ? 12 : 14,
              right: isPhoneFullscreen ? 12 : 14,
              bottom: isPhoneFullscreen ? 38 : 10,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            {speechWaveBars.map((height, index) => (
              <YStack
                key={`speech-wave-${index}`}
                style={{
                  width: 3,
                  height,
                  borderRadius: 999,
                  backgroundColor: index % 2 === 0 ? '#f87171' : '#fb7185',
                  opacity: 0.72 + (((index + speechWaveTick) % 4) * 0.07),
                }}
              />
            ))}
          </XStack>
        ) : null}
      </YStack>

      {!isPhoneFullscreen ? (
        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text color={counterColor} fontSize="$1" fontWeight="700">
            {draftCounter}
          </Text>

          <XStack gap="$2" style={{ alignItems: 'center' }}>
            <Button
              unstyled
              {...speechButtonAccessibilityProps}
              disabled={speechButtonDisabled}
              onPress={speechToText.toggleListening}
              pressStyle={{ opacity: 0.82 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: speechActive ? micActiveColor : '#334155',
                backgroundColor: speechActive ? 'rgba(239, 68, 68, 0.16)' : '#111827',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: speechButtonDisabled ? 0.46 : 1,
                transform: [{ scale: micPulseScale }],
              }}
            >
              <MaterialIcons
                name={speechActive ? 'graphic-eq' : 'keyboard-voice'}
                size={15}
                color={speechActive ? micActiveColor : micNeutralColor}
              />
            </Button>

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
        </XStack>
      ) : null}

      {speechToText.errorMessage ? (
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
          <MaterialIcons
            name="mic-off"
            size={13}
            color="#ef4444"
          />
          <Text
            color="$red10"
            fontSize="$1"
            fontWeight="600"
            style={{ flex: 1 }}
            numberOfLines={2}
          >
            {speechToText.errorMessage}
          </Text>
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
  }

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

