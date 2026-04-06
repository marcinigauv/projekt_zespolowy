import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Button, Input, Label, H2 } from 'tamagui'
import { useAuthStore } from '../src/store/authStore'
import { HeaderMinimal } from '../src/components/Header'
import { PageWrapper, AuthCenter, AuthForm } from '../src/components/styled'

export default function Login() {
  const router = useRouter()
  const login = useAuthStore(s => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <PageWrapper>
      <HeaderMinimal />
      <AuthCenter>
        <AuthForm>
          <H2>Logowanie</H2>
          <YStack gap="$2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" size="$4" placeholder="twoj@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" />
          </YStack>
          <YStack gap="$2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" size="$4" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          </YStack>
          <Button size="$5" theme="blue" onPress={() => { login(email, password); router.replace('/') }}>
            Zaloguj się
          </Button>
          <XStack jc="center" gap="$2">
            <Text color="$gray10">Nie masz konta?</Text>
            <Text color="$blue10" onPress={() => router.replace('/register')}>Zarejestruj się</Text>
          </XStack>
        </AuthForm>
      </AuthCenter>
    </PageWrapper>
  )
}
