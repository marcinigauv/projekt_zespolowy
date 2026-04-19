import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, Text, Label } from 'tamagui'
import { Header } from '../src/components/Header'
import { registerUserUseCase } from '../src/auth/useCases'
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

export default function Register() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegister = async () => {
    try {
      setError('')
      setIsSubmitting(true)
      await registerUserUseCase({ name, email, password })
      router.replace('/')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Nie udało się zarejestrować')
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
              <SectionTitle>Utwórz konto</SectionTitle>
              <SectionDescription>
                Nie masz jeszcze konta? Podaj swoje dane, aby się zarejestrować i zacząć korzystać z naszej aplikacji - całkowicie za darmo!
              </SectionDescription>
            </YStack>

            <FormField>
              <Label htmlFor="name">Imię</Label>
              <FormInput id="name" placeholder="Jan Kowalski" value={name} onChangeText={setName} />
            </FormField>
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
                autoComplete="new-password"
                textContentType="newPassword"
              />
            </FormField>
            {error ? <Text color="$red10">{error}</Text> : null}
            <PrimaryButton disabled={isSubmitting} onPress={() => { void handleRegister() }}>
              Zarejestruj się
            </PrimaryButton>
            <InlineCenter>
              <Text color="$gray10">Masz już konto?</Text>
              <Text color="$blue10" onPress={() => router.replace('/login')}>Zaloguj się</Text>
            </InlineCenter>
          </AuthForm>
        </FormCard>
      </AuthCenter>
    </PageWrapper>
  )
}
