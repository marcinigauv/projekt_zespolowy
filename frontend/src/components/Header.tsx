import React, { useState } from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { XStack, YStack, Text, Button, Popover, Separator, useMedia } from 'tamagui'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { NavBar, NavTitle, NavLink, SurfaceCard } from './styled'

function ProfileMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()

  const go = (path: string) => {
    onClose()
    router.push(path)
  }

  const handleLogout = () => {
    onClose()
    logout()
    router.replace('/')
  }

  if (isAuthenticated && user) {
    return (
      <YStack bg="#ffffff">
        <YStack px="$4" py="$3" gap="$1">
          <XStack gap="$3" style={{ alignItems: 'center' }}>
            <YStack
              width={40}
              height={40}
              bg="$blue9"
              style={{ borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text color="white" fontWeight="700" fontSize="$5">
                {user.name?.[0] || '?'}
              </Text>
            </YStack>
            <YStack>
              <Text fontWeight="700" fontSize="$5">{user.name}</Text>
              <Text fontSize="$3" color="$gray10">{user.email}</Text>
            </YStack>
          </XStack>
        </YStack>

        <Separator />

        <Button chromeless py="$3" px="$4" style={{ justifyContent: 'flex-start' }} onPress={() => go('/profile')}>
          Moje konto
        </Button>
        <Button chromeless py="$3" px="$4" style={{ justifyContent: 'flex-start' }} onPress={handleLogout}>
          <Text color="$red10">Wyloguj się</Text>
        </Button>
      </YStack>
    )
  }

  return (
    <YStack bg="#ffffff">
      <Button chromeless py="$3" px="$4" style={{ justifyContent: 'flex-start' }} onPress={() => go('/login')}>
        Zaloguj się
      </Button>
      <Button chromeless py="$3" px="$4" style={{ justifyContent: 'flex-start' }} onPress={() => go('/register')}>
        Zarejestruj się
      </Button>
    </YStack>
  )
}

export function Header() {
  const router = useRouter()
  const media = useMedia()
  const getTotalItems = useCartStore((s) => s.getTotalItems())
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isCompact = Platform.OS !== 'web' || media.sm
  const cartItems = getTotalItems

  if (!isCompact) {
    return (
      <NavBar px="$6">
        <XStack gap="$3" style={{ alignItems: 'center' }}>
          <YStack
            width={36}
            height={36}
            bg="$blue9"
            style={{ borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text color="white" fontWeight="800">M</Text>
          </YStack>
          <YStack>
            <NavTitle onPress={() => router.push('/')}>Sklep Internetowy</NavTitle>
            <Text color="$gray10" fontSize="$2">Nowoczesne zakupy bez kolejek, stresu i problemów!</Text>
          </YStack>
        </XStack>

        <XStack flex={1} gap="$6" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <NavLink onPress={() => router.push('/')}>Strona główna</NavLink>
          <NavLink onPress={() => router.push('/cart')}>Koszyk</NavLink>
        </XStack>

        <XStack gap="$5" style={{ alignItems: 'center' }}>
          <Button
            chromeless
            onPress={() => router.push('/cart')}
            pressStyle={{ opacity: 0.7 }}
            px="$2"
          >
            <XStack gap="$2" style={{ alignItems: 'center' }}>
              <Text fontSize="$7">Koszyk</Text>
              {cartItems > 0 && (
                <Text
                  background="$red9"
                  color="white"
                  fontSize="$2"
                  fontWeight="700"
                  px="$2"
                  py="$0.5"
                  style={{ borderRadius: 999, minWidth: 20, textAlign: 'center' }}
                >
                  {cartItems}
                </Text>
              )}
            </XStack>
          </Button>

          <Popover open={profileOpen} onOpenChange={setProfileOpen} placement="bottom-end">
            <Popover.Trigger>
              <Button chromeless px="$0">
                <NavLink>Profil</NavLink>
              </Button>
            </Popover.Trigger>
            <Popover.Content
              bg="#ffffff"
              bordered
              elevate
              p={0}
              shadowColor="$shadowColor"
              shadowRadius={20}
              shadowOffset={{ width: 0, height: 10 }}
              style={{ minWidth: 240, borderRadius: 16 }}
            >
              <ProfileMenu onClose={() => setProfileOpen(false)} />
            </Popover.Content>
          </Popover>
        </XStack>
      </NavBar>
    )
  }

  return (
    <>
      <NavBar>
        <XStack gap="$2.5" style={{ alignItems: 'center', flexShrink: 1 }}>
          <YStack
            width={32}
            height={32}
            bg="$blue9"
            style={{ borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text color="white" fontWeight="800" fontSize="$3">M</Text>
          </YStack>
          <NavTitle
            onPress={() => router.push('/')}
            numberOfLines={1}
            style={{ fontSize: 18, lineHeight: 22, flexShrink: 1 }}
          >
            Sklep Internetowy
          </NavTitle>
        </XStack>

        <XStack gap="$2" style={{ alignItems: 'center' }}>
          <Button
            unstyled
            onPress={() => router.push('/cart')}
            pressStyle={{ opacity: 0.85 }}
          >
            <YStack
              bg="#f3f6fa"
              borderColor="$borderColor"
              borderWidth={1}
              width={42}
              height={42}
              style={{ borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              <Text fontSize="$6">🛒</Text>
              {cartItems > 0 && (
                <YStack
                  background="$red9"
                  px="$1.5"
                  py="$0.5"
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -4,
                    borderRadius: 999,
                    minWidth: 20,
                    alignItems: 'center',
                  }}
                >
                  <Text color="white" fontSize="$1" fontWeight="800">{cartItems}</Text>
                </YStack>
              )}
            </YStack>
          </Button>

          <Button
            unstyled
            onPress={() => setMenuOpen((current) => !current)}
            pressStyle={{ opacity: 0.85 }}
          >
            <YStack
              bg="$blue9"
              width={42}
              height={42}
              style={{ borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text color="white" fontSize="$6" fontWeight="800">☰</Text>
            </YStack>
          </Button>
        </XStack>
      </NavBar>

      {menuOpen && (
        <YStack px="$3" pt="$2">
          <SurfaceCard p="$3" gap="$2" style={{ borderRadius: 20 }}>
            <Text fontSize="$6" fontWeight="800" color="$color">Menu</Text>

            <Button
              chromeless
              size="$5"
              style={{ justifyContent: 'flex-start' }}
              onPress={() => {
                setMenuOpen(false)
                router.push('/')
              }}
            >
              Strona główna
            </Button>

            <Button
              chromeless
              size="$5"
              style={{ justifyContent: 'flex-start' }}
              onPress={() => {
                setMenuOpen(false)
                router.push('/cart')
              }}
            >
              Koszyk {cartItems > 0 ? `(${cartItems})` : ''}
            </Button>

            <Separator my="$2" />

            <ProfileMenu onClose={() => setMenuOpen(false)} />
          </SurfaceCard>
        </YStack>
      )}
    </>
  )
}

export function HeaderMinimal() {
  return <Header />
}