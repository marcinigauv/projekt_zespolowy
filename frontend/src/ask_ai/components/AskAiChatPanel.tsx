import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef } from 'react'
import { Platform, ScrollView, useWindowDimensions } from 'react-native'
import { Text, TextArea, XStack, YStack, getVariableValue, useTheme } from 'tamagui'
import { PrimaryButton, SecondaryButton } from '../../components/styled'
import type { AskAiSuggestedProductDto, AskAiTranscriptEntryDto } from '../api'
import type { AskAiChatController } from '../useAskAiChat'

type AskAiChatPanelVariant = 'modal' | 'page'

interface AskAiChatPanelProps {
  controller: AskAiChatController
  variant?: AskAiChatPanelVariant
  expanded?: boolean
}

const QUICK_PROMPTS = [
  {
    label: 'Prezent do 200 zł',
    value: 'Pomóż mi wybrać prezent do 200 zł dla osoby, która lubi elektronikę.',
  },
  {
    label: 'LEGO dla dziecka',
    value: 'Szukam zestawu LEGO dla 8-latka. Pokaż najlepsze opcje i wyjaśnij różnice.',
  },
  {
    label: 'Porównaj gadżety',
    value: 'Porównaj kamerę sportową i Raspberry Pi pod kątem praktycznego prezentu.',
  },
] as const

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
    return 'AskAI przygotowuje odpowiedź...'
  }

  return 'Brak odpowiedzi.'
}

function getConversationStatusLabel(controller: AskAiChatController, isThinking: boolean): string {
  if (controller.error) {
    return 'Problem z połączeniem'
  }

  if (controller.latestMessage?.status === 'session_reset') {
    return 'Sesja wygasła'
  }

  if (controller.isInitializing) {
    return 'Uruchamianie sesji'
  }

  if (isThinking) {
    return 'AskAI analizuje katalog'
  }

  if (controller.transcript.length > 0) {
    return 'Rozmowa aktywna'
  }

  if (controller.sessionId) {
    return 'Sesja gotowa'
  }

  return 'Gotowe do startu'
}

const MODAL_RECOMMENDATION_COLUMN_BREAKPOINT = 1480

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
  const statusLabel = getConversationStatusLabel(controller, isThinking)
  const counterColor = controller.remainingCharacters <= 250 ? '$red10' : controller.remainingCharacters <= 750 ? '$color' : '$placeholderColor'
  const textColor = getVariableValue(theme.color)
  const primaryColor = getVariableValue(theme.stitchPrimary)
  const placeholderColor = getVariableValue(theme.placeholderColor)
  const accentSurface = 'rgba(34, 211, 238, 0.1)'
  const accentSurfaceStrong = 'rgba(34, 211, 238, 0.14)'
  const amberSurface = 'rgba(245, 158, 11, 0.12)'
  const neutralSurface = 'rgba(255, 255, 255, 0.03)'
  const dangerColor = '#ff6b6b'
  const messageInputAccessibilityProps = Platform.OS === 'web'
    ? { 'aria-label': 'Wiadomość do AskAI' }
    : { accessibilityLabel: 'Wiadomość do AskAI' }
  const shadowStyle = {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
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
  const conversationCountLabel = `${controller.transcript.length} wiadomości`

  useEffect(() => {
    if (!controller.transcript.length) {
      return
    }

    transcriptScrollRef.current?.scrollToEnd({ animated: true })
  }, [controller.latestMessage?.status, controller.transcript.length])

  const renderMetaPill = (label: string, value: string, tone: 'default' | 'accent' | 'warning' = 'default') => {
    const backgroundColor = tone === 'accent' ? accentSurfaceStrong : tone === 'warning' ? amberSurface : neutralSurface
    const pillColor = tone === 'accent' ? primaryColor : tone === 'warning' ? '#f59e0b' : placeholderColor

    return (
      <YStack
        borderWidth={1}
        borderColor="$borderColor"
        px="$2.5"
        py="$1.5"
        style={{
          borderRadius: 999,
          backgroundColor,
        }}
      >
        <Text fontSize="$2" fontWeight="700" style={{ color: pillColor }}>
          {label}: {value}
        </Text>
      </YStack>
    )
  }

  const renderStateCard = ({
    icon,
    title,
    description,
    tone = 'default',
    actionLabel,
    onAction,
  }: {
    icon: React.ComponentProps<typeof MaterialIcons>['name']
    title: string
    description: string
    tone?: 'default' | 'warning' | 'danger'
    actionLabel?: string
    onAction?: () => void
  }) => {
    const iconColor = tone === 'danger' ? dangerColor : tone === 'warning' ? '#f59e0b' : primaryColor
    const surfaceColor = tone === 'danger' ? 'rgba(255, 107, 107, 0.14)' : tone === 'warning' ? amberSurface : accentSurface

    return (
      <YStack flex={1} px="$3" py="$4" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <YStack
          borderWidth={1}
          borderColor="$borderColor"
          p="$3"
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: surfaceColor,
          }}
        >
          <MaterialIcons name={icon} size={28} color={iconColor} />
        </YStack>

        <YStack gap="$1.5" style={{ alignItems: 'center', maxWidth: 300, marginTop: 8 }}>
          <Text color="$color" fontFamily="$heading" fontSize="$4" fontWeight="800" style={{ textAlign: 'center' }}>
            {title}
          </Text>
          <Text color="$placeholderColor" fontSize="$2" lineHeight="$4" style={{ textAlign: 'center' }}>
            {description}
          </Text>
        </YStack>

        {actionLabel && onAction ? (
          <YStack style={{ width: '100%', maxWidth: 240, marginTop: 16 }}>
            <SecondaryButton onPress={onAction}>
              {actionLabel}
            </SecondaryButton>
          </YStack>
        ) : null}
      </YStack>
    )
  }

  const renderSuggestedProducts = (products: AskAiSuggestedProductDto[]) => {
    if (!products.length) {
      return null
    }

    return (
      <YStack gap="$2.5">
        {products.map((product) => (
          <YStack
            key={product.id}
            borderWidth={1}
            borderColor="$borderColor"
            bg="$backgroundHover"
            p="$3"
            gap="$2.5"
            style={{
              borderRadius: 20,
              ...shadowStyle,
            }}
          >
            <XStack gap="$3" style={{ alignItems: 'flex-start' }}>
              <YStack
                borderWidth={1}
                borderColor="$borderColor"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: accentSurface,
                }}
              >
                <MaterialIcons name="inventory-2" size={22} color={primaryColor} />
              </YStack>

              <YStack gap="$1.5" style={{ flex: 1, minWidth: 0 }}>
                <XStack gap="$2" flexWrap="wrap" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text color="$color" fontSize="$4" fontWeight="800" style={{ flex: 1, minWidth: 0 }}>
                    {product.name}
                  </Text>
                  <Text color="$color" fontSize="$5" fontWeight="800" style={{ color: primaryColor }}>
                    {formatPrice(product.price)}
                  </Text>
                </XStack>

                <Text color="$placeholderColor" fontSize="$3" lineHeight="$4" numberOfLines={3}>
                  {product.description}
                </Text>
              </YStack>
            </XStack>

            <XStack gap="$2" flexWrap="wrap">
              <Text color="$placeholderColor" fontSize="$2" fontWeight="700">
                Dostępne: {product.amount} szt.
              </Text>
              {product.categories.slice(0, 2).map((category) => (
                <YStack
                  key={`${product.id}-${category}`}
                  borderWidth={1}
                  borderColor="$borderColor"
                  px="$2"
                  py="$1"
                  style={{
                    borderRadius: 999,
                    backgroundColor: neutralSurface,
                  }}
                >
                  <Text color="$placeholderColor" fontSize="$2" fontWeight="700">
                    {category}
                  </Text>
                </YStack>
              ))}
            </XStack>

            <XStack style={{ justifyContent: 'flex-start' }}>
              <SecondaryButton onPress={() => router.push(product.productPath)}>
                Zobacz produkt
              </SecondaryButton>
            </XStack>
          </YStack>
        ))}
      </YStack>
    )
  }

  const renderRecommendationsSection = () => {
    const content = recommendedProducts.length ? (
      showRecommendationColumn ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 6 }}
          keyboardShouldPersistTaps="handled"
        >
          {renderSuggestedProducts(recommendedProducts)}
        </ScrollView>
      ) : (
        renderSuggestedProducts(recommendedProducts)
      )
    ) : (
      <YStack flex={1} px="$2" py="$4" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <YStack
          borderWidth={1}
          borderColor="$borderColor"
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: accentSurface,
          }}
        >
          <MaterialIcons name="auto-awesome" size={24} color={primaryColor} />
        </YStack>

        <YStack gap="$1.5" style={{ alignItems: 'center', maxWidth: 260, marginTop: 8 }}>
          <Text color="$color" fontSize="$4" fontWeight="800" style={{ textAlign: 'center' }}>
            Rekomendacje pojawią się po pierwszej odpowiedzi
          </Text>
          <Text color="$placeholderColor" fontSize="$2" lineHeight="$4" style={{ textAlign: 'center' }}>
            AskAI doda trafione produkty do tej listy w trakcie rozmowy.
          </Text>
        </YStack>
      </YStack>
    )

    return (
      <YStack
        borderWidth={1}
        borderColor="$borderColor"
        bg="$background"
        p="$3"
        gap="$2.5"
        style={{
          flex: showRecommendationColumn ? 1 : undefined,
          minHeight: showRecommendationColumn ? 0 : !isModal ? 150 : 200,
          borderRadius: 22,
          overflow: 'hidden',
          ...shadowStyle,
        }}
      >
        <XStack gap="$2" flexWrap="wrap" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text color="$color" fontFamily="$heading" fontSize="$4" fontWeight="800">
            Rekomendacje
          </Text>
          {recommendedProducts.length ? (
            <Text color="$placeholderColor" fontSize="$2" fontWeight="700">
              {recommendedProducts.length} trafień
            </Text>
          ) : null}
        </XStack>

        <YStack flex={1} style={{ minHeight: 0 }}>
          {content}
        </YStack>
      </YStack>
    )
  }

  const renderTranscriptEntry = (entry: AskAiTranscriptEntryDto) => {
    const assistantTone = entry.status === 'error' ? dangerColor : primaryColor

    return (
      <YStack key={entry.messageId} gap="$2.5">
        <XStack style={{ justifyContent: 'flex-end' }}>
          <YStack
            borderWidth={1}
            borderColor="$borderColor"
            bg="$backgroundHover"
            p="$3.5"
            gap="$2"
            style={{
              maxWidth: isCompactPhone ? '92%' : isModal ? '88%' : '84%',
              borderRadius: 22,
              borderTopRightRadius: 12,
              ...shadowStyle,
            }}
          >
            <XStack gap="$2" flexWrap="wrap" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <XStack gap="$1.5" style={{ alignItems: 'center' }}>
                <YStack
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: neutralSurface,
                  }}
                >
                  <MaterialIcons name="person" size={14} color={placeholderColor} />
                </YStack>
                <Text color="$placeholderColor" fontSize="$2" fontWeight="700">
                  Ty
                </Text>
              </XStack>

              {formatMessageTime(entry.updatedAt) ? (
                <Text color="$placeholderColor" fontSize="$2">
                  {formatMessageTime(entry.updatedAt)}
                </Text>
              ) : null}
            </XStack>

            <Text color="$color" fontSize="$4" lineHeight="$5">
              {entry.userMessage}
            </Text>
          </YStack>
        </XStack>

        <XStack style={{ justifyContent: 'flex-start' }}>
          <YStack
            borderWidth={1}
            borderColor="$borderColor"
            bg="$background"
            p="$3.5"
            gap="$2"
            style={{
              maxWidth: '94%',
              borderRadius: 22,
              borderTopLeftRadius: 12,
              ...shadowStyle,
            }}
          >
            <XStack gap="$2" flexWrap="wrap" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <XStack gap="$1.5" style={{ alignItems: 'center' }}>
                <YStack
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: accentSurface,
                  }}
                >
                  <MaterialIcons name="auto-awesome" size={14} color={assistantTone} />
                </YStack>
                <Text color="$placeholderColor" fontSize="$2" fontWeight="700">
                  AskAI
                </Text>
              </XStack>

              {formatMessageTime(entry.updatedAt) ? (
                <Text color="$placeholderColor" fontSize="$2">
                  {formatMessageTime(entry.updatedAt)}
                </Text>
              ) : null}
            </XStack>

            <Text color="$color" fontSize="$4" lineHeight="$5">
              {getAssistantText(entry)}
            </Text>
          </YStack>
        </XStack>
      </YStack>
    )
  }

  const renderTranscript = () => {
    const showBlockingError = Boolean(controller.error && controller.transcript.length === 0)

    return (
      <YStack
        flex={1}
        borderWidth={1}
        borderColor="$borderColor"
        bg="$background"
        p="$3"
        gap="$2.5"
        style={{
          minHeight: isModal ? 400 : isCompactPhone ? 240 : 420,
          borderRadius: 22,
          overflow: 'hidden',
          ...shadowStyle,
        }}
      >
        <XStack gap="$2" flexWrap="wrap" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <YStack gap="$0.5" style={{ flex: 1, minWidth: 0 }}>
            <Text color="$color" fontFamily="$heading" fontSize="$4" fontWeight="800">
              Rozmowa
            </Text>
            {!isThinking && !controller.error && controller.transcript.length ? (
              <Text color="$placeholderColor" fontSize="$2" fontWeight="700">
                {conversationCountLabel}
              </Text>
            ) : null}
          </YStack>

          {isThinking || controller.error
            ? renderMetaPill('Status', statusLabel, isThinking ? 'accent' : 'warning')
            : null}
        </XStack>

        {controller.error && controller.transcript.length ? (
          <YStack
            borderWidth={1}
            borderColor="$borderColor"
            px="$3"
            py="$2.5"
            style={{
              borderRadius: 22,
              backgroundColor: 'rgba(255, 107, 107, 0.12)',
            }}
          >
            <Text color="$red10" fontSize="$3" fontWeight="700">
              {controller.error}
            </Text>
          </YStack>
        ) : null}

        {controller.isInitializing && controller.transcript.length === 0 ? (
          renderStateCard({
            icon: 'hourglass-top',
            title: 'Uruchamiam nową sesję',
            description: 'Za chwilę możesz zadać pierwsze pytanie i otrzymać listę najlepiej dopasowanych produktów.',
          })
        ) : showBlockingError ? (
          renderStateCard({
            icon: 'wifi-off',
            title: 'Nie udało się połączyć z AskAI',
            description: controller.error,
            tone: 'danger',
            actionLabel: 'Nowa sesja',
            onAction: () => {
              void controller.initializeSession()
            },
          })
        ) : controller.latestMessage?.status === 'session_reset' ? (
          renderStateCard({
            icon: 'history-toggle-off',
            title: 'Bieżąca sesja wygasła',
            description: 'Uruchom nową sesję, aby kontynuować rozmowę i odbudować listę rekomendacji.',
            tone: 'warning',
            actionLabel: 'Rozpocznij od nowa',
            onAction: () => {
              void controller.initializeSession()
            },
          })
        ) : controller.transcript.length ? (
          <ScrollView
            ref={transcriptScrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingBottom: 6 }}
            keyboardShouldPersistTaps="handled"
          >
            {controller.transcript.map(renderTranscriptEntry)}
          </ScrollView>
        ) : (
          renderStateCard({
            icon: 'chat-bubble-outline',
            title: 'Zadaj pierwsze pytanie',
            description: 'Zapytaj o budżet, kategorię albo konkretne zastosowanie produktu.',
          })
        )}
      </YStack>
    )
  }

  const renderComposer = (minHeight: number) => (
    <YStack
      borderWidth={1}
      borderColor="$borderColor"
      bg="$backgroundHover"
      p="$3"
      gap="$2.5"
      style={{
        borderRadius: 22,
        ...shadowStyle,
      }}
    >
      <Text color="$color" fontSize="$4" fontWeight="800">
        Wiadomość
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4, paddingRight: 4 }}>
        {QUICK_PROMPTS.map((prompt) => (
          <SecondaryButton key={prompt.label} onPress={() => controller.setDraft(prompt.value)}>
            {prompt.label}
          </SecondaryButton>
        ))}
      </ScrollView>

      <TextArea
        {...messageInputAccessibilityProps}
        value={controller.draft}
        onChangeText={controller.setDraft}
        placeholder="Napisz, czego szukasz..."
        placeholderTextColor={placeholderColor}
        maxLength={controller.maxMessageLength}
        autoCorrect={false}
        autoCapitalize="sentences"
        borderWidth={1}
        borderColor="$borderColor"
        bg="$background"
        p="$4"
        focusStyle={{ borderColor: '$blue10' }}
        style={{
          minHeight,
          borderRadius: 20,
          color: textColor,
        }}
      />

      {isCompactComposer ? (
        <YStack gap="$2.5">
          <Text color={counterColor} fontSize="$2" fontWeight="700">
            {controller.remainingCharacters} znaków pozostało
          </Text>

          <YStack gap="$2">
            <SecondaryButton disabled={controller.isInitializing} onPress={() => void controller.initializeSession()}>
              Nowa sesja
            </SecondaryButton>
            <PrimaryButton disabled={!controller.canSubmit} onPress={() => void controller.submitMessage()}>
              {isThinking ? 'Generowanie...' : 'Wyślij do AskAI'}
            </PrimaryButton>
          </YStack>
        </YStack>
      ) : (
        <XStack gap="$3" flexWrap="wrap" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Text color={counterColor} fontSize="$2" fontWeight="700">
            {controller.remainingCharacters} znaków pozostało
          </Text>

          <XStack gap="$2" flexWrap="wrap">
            <SecondaryButton disabled={controller.isInitializing} onPress={() => void controller.initializeSession()}>
              Nowa sesja
            </SecondaryButton>
            <PrimaryButton disabled={!controller.canSubmit} onPress={() => void controller.submitMessage()}>
              {isThinking ? 'Generowanie...' : 'Wyślij do AskAI'}
            </PrimaryButton>
          </XStack>
        </XStack>
      )}
    </YStack>
  )

  return (
    <YStack flex={1} gap="$3.5" style={{ minHeight: 0 }}>
      {showRecommendationColumn ? (
        <XStack gap="$3.5" style={{ flex: 1, minHeight: 0 }}>
          <YStack gap="$3.5" style={{ flex: 1.55, minHeight: 0 }}>
            {renderTranscript()}
            {renderComposer(150)}
          </YStack>

          <YStack width={recommendationColumnWidth} style={{ minHeight: 0 }}>
            {renderRecommendationsSection()}
          </YStack>
        </XStack>
      ) : !isModal ? (
        <YStack gap="$3.5" style={{ flex: 1, minHeight: 0 }}>
          {renderTranscript()}
          {renderComposer(isCompactPhone ? 128 : 156)}
          {renderRecommendationsSection()}
        </YStack>
      ) : (
        <YStack gap="$3.5" style={{ flex: 1, minHeight: 0 }}>
          {renderTranscript()}
          {renderComposer(isModal ? 136 : isCompactPhone ? 128 : 156)}
          {renderRecommendationsSection()}
        </YStack>
      )}
    </YStack>
  )
}
