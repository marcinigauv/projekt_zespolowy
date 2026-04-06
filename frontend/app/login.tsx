import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Label } from 'tamagui'
import { useAuthStore } from '../src/store/authStore'
import { Header } from '../src/components/Header'
import {
  PageWrapper,
  AuthCenter,
  AuthForm,
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
  const login = useAuthStore(s => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
              <FormInput id="password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
            </FormField>
            <PrimaryButton onPress={() => { login(email, password); router.replace('/') }}>
              Zaloguj się
            </PrimaryButton>
            <XStack gap="$2" style={{ justifyContent: 'center' }}>
              <Text color="$gray10">Nie masz konta?</Text>
              <Text color="$blue10" onPress={() => router.replace('/register')}>Zarejestruj się</Text>
            </XStack>
          </AuthForm>
        </FormCard>
      </AuthCenter>
    </PageWrapper>
  )
}
