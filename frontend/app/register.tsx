import React, { useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, Text, Label } from 'tamagui'
import { Header } from '../src/components/Header'
import { registerUserUseCase } from '../src/auth/useCases'
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

export default function Register() {
  const router = useRouter()
  const emailInputRef = useRef<React.ElementRef<typeof FormInput>>(null)
  const passwordInputRef = useRef<React.ElementRef<typeof FormInput>>(null)
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
        <FormCard style={{ padding: 0, overflow: 'hidden' }}>
          <YStack>
            <YStack
              gap="$2"
              px="$4.5"
              py="$4.5"
              style={{
                backgroundColor: '#f8f2fa',
                borderBottomWidth: 1,
                borderBottomColor: '#e6e0e9',
              }}
            >
              <Eyebrow>Konto</Eyebrow>
              <SectionTitle>Utwórz konto</SectionTitle>
              <SectionDescription>
                Nie masz jeszcze konta?{"\n"}Podaj swoje dane, aby się zarejestrować i zacząć korzystać z naszej aplikacji - całkowicie za darmo!
              </SectionDescription>
            </YStack>

            <AuthForm style={{ padding: 20 }}>
              <YStack gap="$3">
                <FormField>
                  <Label htmlFor="name">Imię</Label>
                  <FormInput
                    id="name"
                    placeholder="Jan Kowalski"
                    value={name}
                    onChangeText={setName}
                    autoCorrect={false}
                    textContentType="name"
                    returnKeyType="next"
                    submitBehavior="submit"
                    disabled={isSubmitting}
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="email">Email</Label>
                  <FormInput
                    ref={emailInputRef}
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
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    submitBehavior="submit"
                    disabled={isSubmitting}
                    onSubmitEditing={() => {
                      void handleRegister()
                    }}
                  />
                </FormField>
              </YStack>

              {error ? <Text color="$red10">{error}</Text> : null}

              <PrimaryButton disabled={isSubmitting} onPress={() => { void handleRegister() }} style={{ minHeight: 56 }}>
                Zarejestruj się
              </PrimaryButton>

              <InlineCenter style={{ width: '100%', justifyContent: 'center' }}>
                <Text color="$gray10">Masz już konto?</Text>
                <AuthInlineLink onPress={() => router.replace('/login')}>
                  Zaloguj się
                </AuthInlineLink>
              </InlineCenter>
            </AuthForm>
          </YStack>
        </FormCard>
      </AuthCenter>
    </PageWrapper>
  )
}
