import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { XStack, YStack, Text, Button, Popover, Separator, useMedia } from 'tamagui'
import { logoutUserUseCase } from '../auth/useCases'
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  const go = (path: string) => {
    onClose()
    router.push(path)
  }

  const handleLogout = () => {
    onClose()
    void (async () => {
      await logoutUserUseCase()
      router.replace('/')
    })()
  }

  if (isAuthenticated && user) {
    return (
      <HeaderProfileSurface>
        <HeaderProfileSummary>
          <HeaderProfileRow>
            <HeaderAvatar>
              <Text color="#0d6efd" fontWeight="700" fontSize="$5">
                {user.name?.[0] || '?'}
              </Text>
            </HeaderAvatar>
            <YStack>
              <Text fontWeight="700" fontSize="$5" color="#212529">{user.name}</Text>
              <Text fontSize="$3" color="#6c757d">{user.email}</Text>
            </YStack>
          </HeaderProfileRow>
        </HeaderProfileSummary>

        <Separator borderBottomColor="#e9ecef" />

        <HeaderMenuButton onPress={() => go('/profile')}>
          Moje konto
        </HeaderMenuButton>
        <HeaderMenuButton onPress={() => go('/orders')}>
          Historia zamówień
        </HeaderMenuButton>
        {user.isAdmin ? (
          <>
            <Separator borderBottomColor="#e9ecef" />
            <YStack px="$3" pt="$2" pb="$1">
              <Text fontSize="$2" color="#6c757d" fontWeight="700" textTransform="uppercase" letterSpacing={0.8}>
                Panel Admina
              </Text>
            </YStack>
            <HeaderMenuButton onPress={() => go('/admin/products')}>
              Zarządzanie Przedmiotami
            </HeaderMenuButton>
          </>
        ) : null}
        <HeaderMenuButton onPress={handleLogout}>
          <Text color="#dc3545">Wyloguj się</Text>
        </HeaderMenuButton>
      </HeaderProfileSurface>
    )
  }

  return (
    <HeaderProfileSurface width="90%" style={{ paddingTop: "12px", paddingBottom: "12px" }}>
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
  const cartItems = useCartStore((state) => state.getTotalItems())
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isWeb = Platform.OS === 'web'
  const isDesktop = isWeb && media.gtSm
  const isWideDesktop = isWeb && media.gtMd
  const isCompactMobile = !isDesktop && media.xxs
  const navBarStyle = isWeb
    ? { position: 'sticky' as const, top: 0, zIndex: 40 }
    : undefined

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
      <NavBar px={isWideDesktop ? '$6' : '$4'} style={navBarStyle}>
        <HeaderBrand>
          <HeaderBrandMark>
            <Text color="#dae5f6" fontSize="$8" fontWeight="800">SI</Text>
          </HeaderBrandMark>
          <HeaderBrandCopy>
            <NavTitle accessibilityLabel="Przejdź do strony głównej" onPress={() => router.push('/')} color="#212529">Sklep Internetowy</NavTitle>
            {isWideDesktop && <HeaderMeta color="#6c757d">Nowoczesne zakupy bez kolejek, stresu i problemów!</HeaderMeta>}
          </HeaderBrandCopy>
        </HeaderBrand>

        <XStack flex={1} />

        <HeaderControls>
          <Button
            chromeless
            onPress={() => navigate('/cart')}
            pressStyle={{ opacity: 0.7 }}
            px="$2"
            background="#f8f9fa"
            hoverStyle={{ bg: '#e9ecef' }}
          >
            <XStack gap="$2" style={{ alignItems: 'center' }}>
              <NavLink color="#495057">🛒 Koszyk </NavLink>
              {cartItems > 0 && (
                <Text
                  background="#0d6efd"
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
              <Button background="#f8f9fa" chromeless px="$0" hoverStyle={{ bg: '#e9ecef' }}>
                <NavLink color="#495057"> 👤 Profil </NavLink>
              </Button>
            </Popover.Trigger>
            <Popover.Content
              bg="#ffffff"
              bordered
              elevate
              p={0}
              shadowColor="#000000"
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
      <NavBar style={navBarStyle}>
        <HeaderBrand>
          <HeaderBrandMark>
            <Text color="#dae5f6" fontWeight="800" fontSize="$3">SI</Text>
          </HeaderBrandMark>
          <NavTitle
            accessibilityLabel="Przejdź do strony głównej"
            onPress={() => navigate('/')}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
            color="#212529"
          >
            {isCompactMobile ? 'Sklep' : 'Sklep Internetowy'}
          </NavTitle>
        </HeaderBrand>

        <HeaderControls>
          <Button
            unstyled
            onPress={() => navigate('/cart')}
            style={{ background: '#f8f9fa' }}
            pressStyle={{ opacity: 0.85 }}
          >
            <HeaderIconButton>
              <Text color="#0d6efd" fontSize="$6" fontWeight="800">🛒</Text>
              {cartItems > 0 && (
                <HeaderBadge /* style={{ backgroundColor: '#0d6efd' }} */>
                  <Text color="white" fontSize="$1" fontWeight="800">{cartItems}</Text>
                </HeaderBadge>
              )}
            </HeaderIconButton>
          </Button>

          <Button
            unstyled
            onPress={() => setMenuOpen((current) => !current)}
            pressStyle={{ opacity: 0.85 }}
            style={{ background: '#f8f9fa' }}
          >
            <HeaderPrimaryIconButton>
              <Text color="#dae5f6" fontSize="$6" fontWeight="800" >👤</Text>
            </HeaderPrimaryIconButton>
          </Button>
        </HeaderControls>
      </NavBar>

      {menuOpen && (
        <HeaderMenuWrap style={{ zIndex: 39 }}>
          <HeaderMenuCard>
            <Text fontSize="$6" fontWeight="800" color="#212529" >Menu</Text>

            <HeaderMenuButton onPress={() => navigate('/')}>
              Strona główna
            </HeaderMenuButton>

            <HeaderMenuButton onPress={() => navigate('/cart')}>
              Koszyk {cartItems > 0 ? `(${cartItems})` : ''}
            </HeaderMenuButton>

            <Separator my="$2" borderBottomColor="#e9ecef" />

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