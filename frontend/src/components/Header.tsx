import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { XStack, YStack, Text, Button, Popover, Separator, useMedia } from 'tamagui'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import {
  HeaderAvatar,
  HeaderBadge,
  HeaderBrand,
  HeaderBrandCopy,
  HeaderBrandMark,
  HeaderControls,
  HeaderIconButton,
  HeaderInlineNav,
  HeaderMenuButton,
  HeaderMenuCard,
  HeaderMenuWrap,
  HeaderMeta,
  HeaderPrimaryIconButton,
  HeaderProfileRow,
  HeaderProfileSummary,
  HeaderProfileSurface,
  NavBar,
  NavLink,
  NavTitle,
} from './styled'

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
      <HeaderProfileSurface>
        <HeaderProfileSummary>
          <HeaderProfileRow>
            <HeaderAvatar>
              <Text color="white" fontWeight="700" fontSize="$5">
                {user.name?.[0] || '?'}
              </Text>
            </HeaderAvatar>
            <YStack>
              <Text fontWeight="700" fontSize="$5">{user.name}</Text>
              <Text fontSize="$3" color="$gray10">{user.email}</Text>
            </YStack>
          </HeaderProfileRow>
        </HeaderProfileSummary>

        <Separator />

        <HeaderMenuButton onPress={() => go('/profile')}>
          Moje konto
        </HeaderMenuButton>
        <HeaderMenuButton onPress={handleLogout}>
          <Text color="$red10">Wyloguj się</Text>
        </HeaderMenuButton>
      </HeaderProfileSurface>
    )
  }

  return (
    <HeaderProfileSurface>
      <HeaderMenuButton onPress={() => go('/login')}>
        Zaloguj się
      </HeaderMenuButton>
      <HeaderMenuButton onPress={() => go('/register')}>
        Zarejestruj się
      </HeaderMenuButton>
    </HeaderProfileSurface>
  )
}

export function Header() {
  const router = useRouter()
  const media = useMedia()
  const getTotalItems = useCartStore((s) => s.getTotalItems())
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isWeb = Platform.OS === 'web'
  const isDesktop = isWeb && media.gtSm
  const isWideDesktop = isWeb && media.gtMd
  const cartItems = getTotalItems

  useEffect(() => {
    if (isDesktop) {
      setMenuOpen(false)
    }
  }, [isDesktop])

  const navigate = (path: string) => {
    setMenuOpen(false)
    setProfileOpen(false)
    router.push(path)
  }

  if (isDesktop) {
    return (
      <NavBar px={isWideDesktop ? '$6' : '$4'}>
        <HeaderBrand>
          <HeaderBrandMark>
            <Text color="white" fontWeight="800">M</Text>
          </HeaderBrandMark>
          <HeaderBrandCopy>
            <NavTitle onPress={() => router.push('/')}>Sklep Internetowy</NavTitle>
            {isWideDesktop && <HeaderMeta>Nowoczesne zakupy bez kolejek, stresu i problemów!</HeaderMeta>}
          </HeaderBrandCopy>
        </HeaderBrand>

        {isWideDesktop ? (
          <HeaderInlineNav>
            <NavLink onPress={() => navigate('/')}>Strona główna</NavLink>
            <NavLink onPress={() => navigate('/cart')}>Koszyk</NavLink>
          </HeaderInlineNav>
        ) : (
          <XStack flex={1} />
        )}

        <HeaderControls>
          {!isWideDesktop && <NavLink onPress={() => navigate('/')}>Strona główna</NavLink>}
          <Button
            chromeless
            onPress={() => navigate('/cart')}
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
        </HeaderControls>
      </NavBar>
    )
  }

  return (
    <>
      <NavBar>
        <HeaderBrand>
          <HeaderBrandMark>
            <Text color="white" fontWeight="800" fontSize="$3">M</Text>
          </HeaderBrandMark>
          <NavTitle
            onPress={() => navigate('/')}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            Sklep Internetowy
          </NavTitle>
        </HeaderBrand>

        <HeaderControls>
          <Button
            unstyled
            onPress={() => navigate('/cart')}
            pressStyle={{ opacity: 0.85 }}
          >
            <HeaderIconButton>
              <Text fontSize="$6">🛒</Text>
              {cartItems > 0 && (
                <HeaderBadge>
                  <Text color="white" fontSize="$1" fontWeight="800">{cartItems}</Text>
                </HeaderBadge>
              )}
            </HeaderIconButton>
          </Button>

          <Button
            unstyled
            onPress={() => setMenuOpen((current) => !current)}
            pressStyle={{ opacity: 0.85 }}
          >
            <HeaderPrimaryIconButton>
              <Text color="white" fontSize="$6" fontWeight="800">☰</Text>
            </HeaderPrimaryIconButton>
          </Button>
        </HeaderControls>
      </NavBar>

      {menuOpen && (
        <HeaderMenuWrap>
          <HeaderMenuCard>
            <Text fontSize="$6" fontWeight="800" color="$color">Menu</Text>

            <HeaderMenuButton onPress={() => navigate('/')}>
              Strona główna
            </HeaderMenuButton>

            <HeaderMenuButton onPress={() => navigate('/cart')}>
              Koszyk {cartItems > 0 ? `(${cartItems})` : ''}
            </HeaderMenuButton>

            <Separator my="$2" />

            <ProfileMenu onClose={() => setMenuOpen(false)} />
          </HeaderMenuCard>
        </HeaderMenuWrap>
      )}
    </>
  )
}

export function HeaderMinimal() {
  return <Header />
}