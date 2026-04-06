import React, { useState } from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { XStack, YStack, Text, Button, Popover, Separator, Sheet } from 'tamagui'
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

  if (isAuthenticated) {
    return (
      <YStack>
        <YStack px="$3" py="$2">
          <Text fontWeight="bold">{user?.name}</Text>
          <Text fontSize="$2" color="$gray10">{user?.email}</Text>
        </YStack>
        <Separator />
        <Button chromeless jc="flex-start" onPress={() => go('/profile')}>Moje konto</Button>
        <Button chromeless jc="flex-start" color="$red10" onPress={handleLogout}>Wyloguj się</Button>
      </YStack>
    )
  }

  return (
    <YStack>
      <Button chromeless jc="flex-start" onPress={() => go('/login')}>Zaloguj się</Button>
      <Button chromeless jc="flex-start" onPress={() => go('/register')}>Zarejestruj się</Button>
    </YStack>
  )
}

export function Header() {
  const router = useRouter()
  const getTotalItems = useCartStore(s => s.getTotalItems)
  const [profileOpen, setProfileOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  if (Platform.OS === 'web') {
    return (
      <NavBar px="$5">
        <NavTitle onPress={() => router.push('/')}>
          Sklep
        </NavTitle>
        <XStack gap="$5" ai="center">
          <NavLink onPress={() => router.push('/')}>
            Strona główna
          </NavLink>
          <NavLink onPress={() => router.push('/cart')}>
            Koszyk ({getTotalItems()})
          </NavLink>
          <Popover open={profileOpen} onOpenChange={setProfileOpen} placement="bottom-end">
            <Popover.Trigger>
              <NavLink>Profil ▾</NavLink>
            </Popover.Trigger>
            <Popover.Content bg="$background" bordered elevate p="$2" minWidth={200}>
              <ProfileMenu onClose={() => setProfileOpen(false)} />
            </Popover.Content>
          </Popover>
        </XStack>
      </NavBar>
    )
  }

  return (
    <>
      <NavBar px="$4">
        <NavTitle onPress={() => router.push('/')}>
          Sklep
        </NavTitle>
        <Button chromeless onPress={() => setSheetOpen(true)}>
          <Text color="white" fontSize="$7">☰</Text>
        </Button>
      </NavBar>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} snapPoints={[50]} dismissOnSnapToBottom modal>
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame>
          <YStack p="$4" gap="$1">
            <Button size="$5" chromeless jc="flex-start" onPress={() => { setSheetOpen(false); router.push('/') }}>
              Strona główna
            </Button>
            <Button size="$5" chromeless jc="flex-start" onPress={() => { setSheetOpen(false); router.push('/cart') }}>
              Koszyk ({getTotalItems()})
            </Button>
            <Separator />
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
      <NavTitle onPress={() => router.push('/')}>
        Sklep
      </NavTitle>
    </NavBar>
  )
}
