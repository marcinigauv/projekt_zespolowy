import React, { useState } from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { XStack, YStack, Text, Button, Popover, Separator, Sheet, Image } from 'tamagui'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { NavBar, NavTitle, NavLink } from './styled'

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
      <YStack>
        <YStack px="$4" py="$3" gap="$1">
          <XStack ai="center" gap="$3">
            {/* Avatar */}
            <YStack
              width={40}
              height={40}
              borderRadius="$10"
              bg="$blue8"
              ai="center"
              jc="center"
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

        <Button chromeless jc="flex-start" py="$3" px="$4" onPress={() => go('/profile')}>
          👤 Moje konto
        </Button>
        <Button chromeless jc="flex-start" py="$3" px="$4" color="$red10" onPress={handleLogout}>
          ⭍ Wyloguj się
        </Button>
      </YStack>
    )
  }

  return (
    <YStack>
      <Button chromeless jc="flex-start" py="$3" px="$4" onPress={() => go('/login')}>
        Zaloguj się
      </Button>
      <Button chromeless jc="flex-start" py="$3" px="$4" onPress={() => go('/register')}>
        Zarejestruj się
      </Button>
    </YStack>
  )
}

export function Header() {
  const router = useRouter()
  const getTotalItems = useCartStore((s) => s.getTotalItems())
  const [profileOpen, setProfileOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // ==================== WEB ====================
  if (Platform.OS === 'web') {
    return (
      <NavBar px="$6">
        <NavTitle onPress={() => router.push('/')}>Sklep</NavTitle>

        {/* Menu środkowe */}
        <XStack flex={1} justifyContent="center" gap="$6" ai="center">
          <NavLink onPress={() => router.push('/')}>Strona główna</NavLink>
        </XStack>

        {/* Prawa strona */}
        <XStack ai="center" gap="$5">
          {/* Koszyk */}
          <Button
            chromeless
            onPress={() => router.push('/cart')}
            pressStyle={{ opacity: 0.7 }}
          >
            <XStack ai="center" gap="$2">
              <Text fontSize="$7">🛒</Text>
              {getTotalItems > 0 && (
                <Text
                  backgroundColor="$red9"
                  color="white"
                  fontSize="$2"
                  fontWeight="700"
                  borderRadius="$10"
                  px="$2"
                  py="$0.5"
                  minWidth={20}
                  textAlign="center"
                >
                  {getTotalItems}
                </Text>
              )}
            </XStack>
          </Button>

          {/* Profil */}
          <Popover open={profileOpen} onOpenChange={setProfileOpen} placement="bottom-end">
            <Popover.Trigger>
              <NavLink>Profil ▾</NavLink>
            </Popover.Trigger>
            <Popover.Content
              bg="$background"
              bordered
              elevate
              p={0}
              minWidth={240}
              borderRadius="$8"
              shadowColor="$shadowColor"
              shadowRadius={20}
              shadowOffset={{ width: 0, height: 10 }}
            >
              <ProfileMenu onClose={() => setProfileOpen(false)} />
            </Popover.Content>
          </Popover>
        </XStack>
      </NavBar>
    )
  }

  // ==================== MOBILE ====================
  return (
    <>
      <NavBar px="$4">
        <NavTitle onPress={() => router.push('/')}>Sklep</NavTitle>

        <XStack ai="center" gap="$4">
          {/* Koszyk na mobile */}
          <Button chromeless onPress={() => router.push('/cart')} pressStyle={{ opacity: 0.7 }}>
            <XStack ai="center" gap="$2">
              <Text fontSize="$8">🛒</Text>
              {getTotalItems > 0 && (
                <Text
                  backgroundColor="$red9"
                  color="white"
                  fontSize="$3"
                  fontWeight="700"
                  borderRadius="$full"
                  px="$2"
                  py="$0.5"
                  minWidth={22}
                  textAlign="center"
                >
                  {getTotalItems}
                </Text>
              )}
            </XStack>
          </Button>

          {/* Hamburger */}
          <Button chromeless onPress={() => setSheetOpen(true)}>
            <Text color="white" fontSize="$8">☰</Text>
          </Button>
        </XStack>
      </NavBar>

      {/* Sheet na mobile */}
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[65]}
        dismissOnSnapToBottom
        modal
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame bg="$background">
          <YStack p="$5" gap="$2" flex={1}>
            <Button
              size="$6"
              chromeless
              jc="flex-start"
              onPress={() => {
                setSheetOpen(false)
                router.push('/')
              }}
            >
              🏠 Strona główna
            </Button>

            <Separator marginVertical="$4" />

            <ProfileMenu onClose={() => setSheetOpen(false)} />
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}

export function HeaderMinimal() {
  const router = useRouter()
  return (
    <NavBar px="$4">
      <NavTitle onPress={() => router.push('/')}>Sklep</NavTitle>
    </NavBar>
  )
}