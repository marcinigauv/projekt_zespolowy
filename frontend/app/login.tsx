import React, { useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, Text, Label } from 'tamagui'
import { Header } from '../src/components/Header'
import { loginUserUseCase } from '../src/auth/useCases'
import {
  AuthInlineLink,
  PageWrapper,
  AuthCenter,
  AuthForm,
  InlineCenter,
  Eyebrow,
  FormCard,
  FormField,
  FormInput,
  PrimaryButton,
  SectionDescription,
  SectionTitle,
} from '../src/components/styled'

export default function Login() {
  const router = useRouter()
  const passwordInputRef = useRef<React.ElementRef<typeof FormInput>>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async () => {
    try {
      setError('')
      setIsSubmitting(true)
      await loginUserUseCase({ email, password })
      router.replace('/')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się zalogować')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageWrapper>
      <Header />
      <AuthCenter>
        <FormCard style={{ padding: 0, overflow: 'hidden' }}>
          <YStack>
            <YStack
              gap="$2"
              px="$4.5"
              py="$4.5"
              bg="$stitchSurfaceVariant"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <Eyebrow>Konto</Eyebrow>
              <SectionTitle>Zaloguj się</SectionTitle>
              <SectionDescription>
                Podaj swoje dane, aby uzyskać dostęp do swojego konta i zamówień
              </SectionDescription>
            </YStack>

            <AuthForm style={{ padding: 20 }}>
              <YStack gap="$3">
                <FormField>
                  <Label htmlFor="email">Email</Label>
                  <FormInput
                    id="email"
                    placeholder="twoj@email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    submitBehavior="submit"
                    disabled={isSubmitting}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="password">Hasło</Label>
                  <FormInput
                    ref={passwordInputRef}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    type="password"
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="done"
                    submitBehavior="submit"
                    disabled={isSubmitting}
                    onSubmitEditing={() => {
                      void handleLogin()
                    }}
                  />
                </FormField>
              </YStack>

              {error ? <Text color="$red10">{error}</Text> : null}

              <PrimaryButton disabled={isSubmitting} onPress={() => { void handleLogin() }} style={{ minHeight: 56 }}>
                Zaloguj się
              </PrimaryButton>

              <InlineCenter style={{ width: '100%', justifyContent: 'center' }}>
                <Text color="$gray10">Nie masz konta?</Text>
                <AuthInlineLink onPress={() => router.replace('/register')}>
                  Zarejestruj się
                </AuthInlineLink>
              </InlineCenter>
            </AuthForm>
          </YStack>
        </FormCard>
      </AuthCenter>
    </PageWrapper>
  )
}
