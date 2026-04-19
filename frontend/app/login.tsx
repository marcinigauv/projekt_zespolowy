import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, Text, Label } from 'tamagui'
import { Header } from '../src/components/Header'
import { loginUserUseCase } from '../src/auth/useCases'
import {
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
        <FormCard>
          <AuthForm>
            <YStack gap="$2">
              <Eyebrow>Konto</Eyebrow>
              <SectionTitle>Zaloguj się</SectionTitle>
              <SectionDescription>
                Podaj swoje dane, aby uzyskać dostęp do swojego konta i zamówień
              </SectionDescription>
            </YStack>

            <FormField>
              <Label htmlFor="email">Email</Label>
              <FormInput id="email" placeholder="twoj@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" />
            </FormField>
            <FormField>
              <Label htmlFor="password">Hasło</Label>
              <FormInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                type="password"
                autoComplete="current-password"
                textContentType="password"
              />
            </FormField>
            {error ? <Text color="$red10">{error}</Text> : null}
            <PrimaryButton disabled={isSubmitting} onPress={() => { void handleLogin() }}>
              Zaloguj się
            </PrimaryButton>
            <InlineCenter>
              <Text color="$gray10">Nie masz konta?</Text>
              <Text color="$blue10" onPress={() => router.replace('/register')}>Zarejestruj się</Text>
            </InlineCenter>
          </AuthForm>
        </FormCard>
      </AuthCenter>
    </PageWrapper>
  )
}
