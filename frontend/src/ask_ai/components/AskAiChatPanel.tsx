import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef } from 'react'
import { Platform, ScrollView, useWindowDimensions } from 'react-native'
import { Button, Text, TextArea, XStack, YStack, getVariableValue, useTheme } from 'tamagui'
import type { AskAiSuggestedProductDto, AskAiTranscriptEntryDto } from '../api'
import type { AskAiChatController } from '../useAskAiChat'

type AskAiChatPanelVariant = 'modal' | 'page'

interface AskAiChatPanelProps {
  controller: AskAiChatController
  variant?: AskAiChatPanelVariant
  expanded?: boolean
}

const MODAL_RECOMMENDATION_COLUMN_BREAKPOINT = 1380

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

export function AskAiChatPanel({ controller, variant = 'page', expanded = false }: AskAiChatPanelProps): React.JSX.Element {
  const router = useRouter()
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const transcriptScrollRef = useRef<ScrollView>(null)
  const isModal = variant === 'modal'
  const isCompactPhone = !isModal && width <= 430
  const isCompactComposer = isCompactPhone || (isModal && width <= 860)
  const showRecommendationColumn = isModal && expanded && width >= MODAL_RECOMMENDATION_COLUMN_BREAKPOINT
  const recommendationColumnWidth = width >= 1900 ? 320 : 292
  const isThinking = controller.isSubmitting || controller.latestMessage?.status === 'pending' || controller.latestMessage?.status === 'running'
  const statusLabel = getStatusLabel(controller, isThinking)
  const textColor = getVariableValue(theme.color)
  const primaryColor = getVariableValue(theme.stitchPrimary)
  const placeholderColor = getVariableValue(theme.placeholderColor)
  const borderColor = getVariableValue(theme.borderColor)
  const surfaceColor = getVariableValue(theme.background)
  const hoverColor = getVariableValue(theme.backgroundHover)
  const counterColor = controller.remainingCharacters <= 250 ? '$red10' : '$placeholderColor'
  const draftCounter = `${controller.characterCount}/${controller.maxMessageLength}`
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

  const statusDotColor = controller.error
    ? '#f87171'
    : isThinking
      ? primaryColor
      : controller.isInitializing
        ? '#f59e0b'
        : 'rgba(148, 163, 184, 0.7)'

  const renderRecommendationCard = (product: AskAiSuggestedProductDto) => {
    const card = (
      <YStack
        borderWidth={1}
        borderColor="$borderColor"
        bg="$backgroundHover"
        p="$2.5"
        gap="$1.5"
        style={{
          borderRadius: 14,
          ...shadowStyle,
        }}
      >
        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text color="$color" fontSize="$3" fontWeight="700" numberOfLines={1} style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
            {product.name}
          </Text>
          <Text color="$stitchPrimary" fontSize="$3" fontWeight="700">
            {formatPrice(product.price)}
          </Text>
        </XStack>

        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text color="$placeholderColor" fontSize="$1" fontWeight="600">
            {product.amount} szt.
          </Text>
          <MaterialIcons name="open-in-new" size={13} color={placeholderColor} />
        </XStack>
      </YStack>
    )

    if (Platform.OS === 'web') {
      return (
        <a
          key={product.id}
          href={product.productPath}
          style={{
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
          }}
          aria-label={product.name}
        >
          {card}
        </a>
      )
    }

    return (
      <Button
        key={product.id}
        unstyled
        onPress={() => router.push(product.productPath)}
      >
        {card}
      </Button>
    )
  }

  const renderRecommendationsSection = () => {
    if (!recommendedProducts.length) {
      return null
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
        borderWidth={1}
        borderColor="$borderColor"
        bg="$background"
        p="$2.5"
        gap="$2"
        style={{
          minHeight: isModal ? 340 : isCompactPhone ? 210 : 300,
          borderRadius: 16,
          overflow: 'hidden',
          ...shadowStyle,
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
            {statusLabel ? (
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
              width: 28,
              height: 28,
              borderRadius: 999,
              borderWidth: 1,
              borderColor,
              backgroundColor: hoverColor,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: controller.isInitializing ? 0.5 : 1,
            }}
          >
            <MaterialIcons name="restart-alt" size={14} color={placeholderColor} />
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
      borderWidth={1}
      borderColor="$borderColor"
      bg="$backgroundHover"
      p="$2"
      gap="$1.5"
      style={{
        borderRadius: 16,
        ...shadowStyle,
      }}
    >
      <TextArea
        {...messageInputAccessibilityProps}
        value={controller.draft}
        onChangeText={controller.setDraft}
        onKeyDown={(event: any) => {
          if (Platform.OS !== 'web') {
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
        placeholder="Napisz wiadomość..."
        placeholderTextColor={placeholderColor}
        maxLength={controller.maxMessageLength}
        autoCorrect={false}
        autoCapitalize="sentences"
        multiline
        borderWidth={1}
        borderColor="$borderColor"
        bg="$background"
        p="$2.5"
        focusStyle={{ borderColor: '$blue10' }}
        style={{
          minHeight,
          maxHeight: 148,
          borderRadius: 12,
          color: textColor,
          fontSize: 13,
          lineHeight: 18,
        }}
      />

      <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text color={counterColor} fontSize="$1" fontWeight="700">
          {draftCounter}
        </Text>

        <Button
          unstyled
          {...sendButtonAccessibilityProps}
          disabled={!controller.canSubmit}
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
            backgroundColor: controller.canSubmit ? surfaceColor : hoverColor,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: controller.canSubmit ? 1 : 0.55,
          }}
        >
          <MaterialIcons
            name={isThinking ? 'hourglass-top' : 'send'}
            size={15}
            color={controller.canSubmit ? primaryColor : placeholderColor}
          />
        </Button>
      </XStack>
    </YStack>
  )

  const recommendationsSection = renderRecommendationsSection()

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

