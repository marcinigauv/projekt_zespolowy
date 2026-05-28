import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

type SpeechErrorCode =
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'no-speech'
  | 'language-not-supported'
  | 'bad-grammar'
  | 'unknown'

interface SpeechRecognitionAlternativeLike {
  transcript?: string
}

interface SpeechRecognitionResultLike {
  isFinal?: boolean
  length: number
  [index: number]: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionResultListLike {
  length: number
  [index: number]: SpeechRecognitionResultLike
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex?: number
  results?: SpeechRecognitionResultListLike
}

interface SpeechRecognitionErrorEventLike extends Event {
  error?: SpeechErrorCode
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onstart: ((event: Event) => void) | null
  onend: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike
type AudioContextCtor = new () => AudioContext

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
    webkitAudioContext?: AudioContextCtor
  }
}

interface UsePolishSpeechToTextOptions {
  enabled: boolean
  onFinalText: (text: string) => void
}

export interface PolishSpeechToTextController {
  isSupported: boolean
  isListening: boolean
  isStarting: boolean
  interimTranscript: string
  audioLevel: number
  errorMessage: string
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
}

const ERROR_AUTOCLEAR_MS = 4200

function normalizeTranscriptToPolishSentences(rawText: string): string {
  const sanitizedText = rawText
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim()

  if (!sanitizedText) {
    return ''
  }

  const pieces = sanitizedText
    .split(/(?<=[.!?])\s+/u)
    .map((piece) => piece.trim())
    .filter(Boolean)

  const normalizedPieces = (pieces.length ? pieces : [sanitizedText]).map((piece) => {
    const normalizedPiece = piece[0].toLocaleUpperCase('pl-PL') + piece.slice(1)
    return /[.!?…]$/u.test(normalizedPiece) ? normalizedPiece : `${normalizedPiece}.`
  })

  return normalizedPieces.join(' ')
}

function mapSpeechErrorMessage(code?: SpeechErrorCode): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Brak dostępu do mikrofonu. Włącz uprawnienia i spróbuj ponownie.'
    case 'language-not-supported':
      return 'Twoja przeglądarka nie wspiera dyktowania po polsku.'
    case 'aborted':
      return ''
    case 'audio-capture':
    case 'network':
    case 'no-speech':
    case 'bad-grammar':
    case 'unknown':
      return 'Nie udało się rozpoznać mowy - spróbuj ponownie.'
    default:
      return 'Nie udało się rozpoznać mowy - spróbuj ponownie.'
  }
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

function getAudioContextCtor(): AudioContextCtor | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null
  }

  return window.AudioContext ?? window.webkitAudioContext ?? null
}

export function usePolishSpeechToText({ enabled, onFinalText }: UsePolishSpeechToTextOptions): PolishSpeechToTextController {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioFrameRef = useRef<number | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const permissionBlockedRef = useRef(false)
  const lastFinalDispatchRef = useRef('')
  const onFinalTextRef = useRef(onFinalText)

  const [isListening, setIsListening] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  onFinalTextRef.current = onFinalText

  const recognitionCtor = getSpeechRecognitionCtor()
  const audioContextCtor = getAudioContextCtor()
  const isSupported = Boolean(recognitionCtor)

  const clearErrorTimeout = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = null
    }
  }, [])

  const showTemporaryError = useCallback((message: string) => {
    if (!message) {
      return
    }

    clearErrorTimeout()
    setErrorMessage(message)
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage('')
    }, ERROR_AUTOCLEAR_MS)
  }, [clearErrorTimeout])

  const stopAudioMetering = useCallback(() => {
    if (audioFrameRef.current) {
      cancelAnimationFrame(audioFrameRef.current)
      audioFrameRef.current = null
    }

    audioSourceRef.current?.disconnect()
    audioAnalyserRef.current?.disconnect()

    if (audioContextRef.current) {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      audioStreamRef.current = null
    }

    audioSourceRef.current = null
    audioAnalyserRef.current = null
    setAudioLevel(0)
  }, [])

  const startAudioMetering = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return true
    }

    if (!window.navigator?.mediaDevices?.getUserMedia) {
      return true
    }

    stopAudioMetering()

    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream

      if (!audioContextCtor) {
        return true
      }

      const audioContext = new audioContextCtor()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.82
      source.connect(analyser)

      audioContextRef.current = audioContext
      audioSourceRef.current = source
      audioAnalyserRef.current = analyser

      const samples = new Uint8Array(analyser.fftSize)
      let smoothedLevel = 0

      const tick = () => {
        const activeAnalyser = audioAnalyserRef.current
        if (!activeAnalyser) {
          return
        }

        activeAnalyser.getByteTimeDomainData(samples)

        let sumSquares = 0
        for (let index = 0; index < samples.length; index += 1) {
          const normalized = (samples[index] - 128) / 128
          sumSquares += normalized * normalized
        }

        const rms = Math.sqrt(sumSquares / samples.length)
        smoothedLevel = (smoothedLevel * 0.74) + (rms * 0.26)
        setAudioLevel(Math.max(0, Math.min(1, smoothedLevel * 3.5)))

        audioFrameRef.current = requestAnimationFrame(tick)
      }

      tick()
      return true
    } catch (caughtError) {
      const errorName = caughtError instanceof Error ? caughtError.name : ''
      if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
        permissionBlockedRef.current = true
        showTemporaryError('Brak dostępu do mikrofonu. Włącz uprawnienia i spróbuj ponownie.')
      } else {
        showTemporaryError('Nie udało się rozpoznać mowy - spróbuj ponownie.')
      }
      stopAudioMetering()
      return false
    }
  }, [audioContextCtor, showTemporaryError, stopAudioMetering])

  const stopListening = useCallback(() => {
    clearErrorTimeout()
    setErrorMessage('')
    setIsStarting(false)
    setIsListening(false)
    setInterimTranscript('')
    stopAudioMetering()

    try {
      recognitionRef.current?.stop()
    } catch {
      return
    }
  }, [clearErrorTimeout, stopAudioMetering])

  const startListening = useCallback(() => {
    if (!enabled) {
      showTemporaryError('Dyktowanie jest chwilowo niedostępne podczas wysyłania wiadomości.')
      return
    }

    if (!isSupported || !recognitionRef.current) {
      showTemporaryError('Ta przeglądarka nie wspiera dyktowania mowy.')
      return
    }

    if (permissionBlockedRef.current) {
      showTemporaryError('Brak uprawnień do mikrofonu. Włącz dostęp i odśwież stronę.')
      return
    }

    clearErrorTimeout()
    setErrorMessage('')
    setIsStarting(true)
    setInterimTranscript('')
    lastFinalDispatchRef.current = ''

    void (async () => {
      const audioReady = await startAudioMetering()
      if (!audioReady) {
        setIsStarting(false)
        return
      }

      try {
        recognitionRef.current?.start()
      } catch {
        setIsStarting(false)
        stopAudioMetering()
        showTemporaryError('Nie udało się uruchomić mikrofonu. Spróbuj ponownie.')
      }
    })()
  }, [clearErrorTimeout, enabled, isSupported, showTemporaryError, startAudioMetering, stopAudioMetering])

  const toggleListening = useCallback(() => {
    if (isListening || isStarting) {
      stopListening()
      return
    }

    startListening()
  }, [isListening, isStarting, startListening, stopListening])

  useEffect(() => {
    if (!isSupported || !recognitionCtor) {
      return
    }

    const recognition = new recognitionCtor()
    recognition.lang = 'pl-PL'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setIsStarting(false)
      clearErrorTimeout()
      setErrorMessage('')
      lastFinalDispatchRef.current = ''
    }

    recognition.onresult = (event) => {
      const results = event.results

      if (!results) {
        return
      }

      const finalSegments: string[] = []
      let interimSegment = ''

      const pushUniqueFinalSegment = (segment: string) => {
        if (!segment) {
          return
        }

        const previousSegment = finalSegments[finalSegments.length - 1]
        if (!previousSegment) {
          finalSegments.push(segment)
          return
        }

        if (segment === previousSegment || previousSegment.endsWith(segment)) {
          return
        }

        if (segment.startsWith(previousSegment)) {
          finalSegments[finalSegments.length - 1] = segment
          return
        }

        finalSegments.push(segment)
      }

      for (let index = 0; index < results.length; index += 1) {
        const result = results[index]
        const transcript = result[0]?.transcript?.trim() ?? ''

        if (!transcript) {
          continue
        }

        if (result.isFinal) {
          pushUniqueFinalSegment(transcript)
        } else {
          interimSegment = transcript
        }
      }

      const liveTranscript = [...finalSegments, interimSegment].filter(Boolean).join(' ')
      const finalTranscript = finalSegments.join(' ')

      const normalizedLiveTranscript = normalizeTranscriptToPolishSentences(liveTranscript)
      if (!normalizedLiveTranscript) {
        return
      }

      setInterimTranscript(normalizedLiveTranscript)

      const normalizedFinalTranscript = normalizeTranscriptToPolishSentences(finalTranscript)
      if (normalizedFinalTranscript && normalizedFinalTranscript !== lastFinalDispatchRef.current) {
        lastFinalDispatchRef.current = normalizedFinalTranscript
        onFinalTextRef.current(normalizedFinalTranscript)
      }
    }

    recognition.onerror = (event) => {
      const code = event.error
      const message = mapSpeechErrorMessage(code)

      if (code === 'aborted') {
        return
      }

      if (code === 'not-allowed' || code === 'service-not-allowed') {
        permissionBlockedRef.current = true
      }

      setIsListening(false)
      setIsStarting(false)
      setInterimTranscript('')
      stopAudioMetering()
      showTemporaryError(message)
    }

    recognition.onend = () => {
      setIsListening(false)
      setIsStarting(false)
      setInterimTranscript('')
      stopAudioMetering()
    }

    recognitionRef.current = recognition

    return () => {
      clearErrorTimeout()
      stopAudioMetering()
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null

      try {
        recognition.abort()
      } catch {
        // Ignore abort errors on unmount.
      }

      recognitionRef.current = null
    }
  }, [clearErrorTimeout, isSupported, recognitionCtor, showTemporaryError, stopAudioMetering])

  useEffect(() => {
    if (enabled) {
      return
    }

    stopListening()
    clearErrorTimeout()
    setErrorMessage('')
  }, [clearErrorTimeout, enabled, stopListening])

  useEffect(() => {
    return () => {
      clearErrorTimeout()
    }
  }, [clearErrorTimeout])

  return {
    isSupported,
    isListening,
    isStarting,
    interimTranscript,
    audioLevel,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  }
}
