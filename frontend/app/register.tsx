import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Button, Input, Label, H2 } from 'tamagui'
import { useAuthStore } from '../src/store/authStore'
import { HeaderMinimal } from '../src/components/Header'
import { PageWrapper, AuthCenter, AuthForm } from '../src/components/styled'

export default function Register() {
  const router = useRouter()
  const register = useAuthStore(s => s.register)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <PageWrapper>
      <HeaderMinimal />
      <AuthCenter>
        <AuthForm>
          <H2>Rejestracja</H2>
          <YStack gap="$2">
            <Label htmlFor="name">Imię</Label>
            <Input id="name" size="$4" placeholder="Jan Kowalski" value={name} onChangeText={setName} />
          </YStack>
          <YStack gap="$2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" size="$4" placeholder="twoj@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" />
          </YStack>
          <YStack gap="$2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" size="$4" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          </YStack>
          <Button size="$5" theme="green" onPress={() => { register(email, password, name); router.replace('/') }}>
            Zarejestruj się
          </Button>
          <XStack jc="center" gap="$2">
            <Text color="$gray10">Masz już konto?</Text>
            <Text color="$blue10" onPress={() => router.replace('/login')}>Zaloguj się</Text>
          </XStack>
        </AuthForm>
      </AuthCenter>
    </PageWrapper>
  )
}
