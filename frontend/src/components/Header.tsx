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
              <Text color="$blue10" fontWeight="700" fontSize="$5">
                {user.name?.[0] || '?'}
              </Text>
            </HeaderAvatar>
            <YStack>
              <Text fontWeight="700" fontSize="$5" color="$color">{user.name}</Text>
              <Text fontSize="$3" color="$placeholderColor">{user.email}</Text>
            </YStack>
          </HeaderProfileRow>
        </HeaderProfileSummary>

        <Separator borderBottomColor="$borderColor" />

        <HeaderMenuButton onPress={() => go('/profile')}>
          Moje konto
        </HeaderMenuButton>
        <HeaderMenuButton onPress={() => go('/orders')}>
          Historia zamowien
        </HeaderMenuButton>
        {user.isAdmin ? (
          <>
            <Separator borderBottomColor="$borderColor" />
            <YStack px="$3" pt="$2" pb="$1">
              <Text fontSize="$2" color="$gray11" fontWeight="700" textTransform="uppercase" letterSpacing={0.8}>
                Panel Admina
              </Text>
            </YStack>
            <HeaderMenuButton onPress={() => go('/admin/products')}>
              Zarzadzanie Przedmiotami
            </HeaderMenuButton>
          </>
        ) : null}
        <HeaderMenuButton onPress={handleLogout}>
          <Text color="$red10">Wyloguj sie</Text>
        </HeaderMenuButton>
      </HeaderProfileSurface>
    )
  }

  return (
    <HeaderProfileSurface width="90%" style={{ paddingTop: 12, paddingBottom: 12 }}>
      <HeaderMenuButton onPress={() => go('/login')}>
        Zaloguj sie
      </HeaderMenuButton>
      <HeaderMenuButton onPress={() => go('/register')}>
        Zarejestruj sie
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
            <Text color="$color" fontSize="$6" fontWeight="700">SI</Text>
          </HeaderBrandMark>
          <HeaderBrandCopy>
            <NavTitle accessibilityLabel="Przejdz do strony glownej" onPress={() => router.push('/')}>
              Sklep Internetowy
            </NavTitle>
            {isWideDesktop && (
              <HeaderMeta>
                Spokojne zakupy online z nowoczesnym, minimalistycznym interfejsem.
              </HeaderMeta>
            )}
          </HeaderBrandCopy>
        </HeaderBrand>

        <XStack flex={1} />

        <HeaderControls>
          <Button
            chromeless
            onPress={() => navigate('/cart')}
            pressStyle={{ opacity: 0.75 }}
            px="$2.5"
            py="$1"
            background="$backgroundHover"
            hoverStyle={{ bg: '$backgroundPress' }}
            style={{ borderRadius: 14 }}
          >
            <XStack gap="$2" style={{ alignItems: 'center' }}>
              <NavLink>Koszyk</NavLink>
              {cartItems > 0 && (
                <Text
                  background="$blue10"
                  color="$background"
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
              <Button
                chromeless
                px="$2.5"
                py="$1"
                background="$backgroundHover"
                hoverStyle={{ bg: '$backgroundPress' }}
                style={{ borderRadius: 14 }}
              >
                <NavLink>Profil</NavLink>
              </Button>
            </Popover.Trigger>
            <Popover.Content
              bg="$background"
              bordered
              elevate
              p={0}
              shadowRadius={20}
              shadowOffset={{ width: 0, height: 10 }}
              style={{ minWidth: 250, borderRadius: 18 }}
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
            <Text color="$color" fontWeight="700" fontSize="$3">SI</Text>
          </HeaderBrandMark>
          <NavTitle
            accessibilityLabel="Przejdz do strony glownej"
            onPress={() => navigate('/')}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {isCompactMobile ? 'Sklep' : 'Sklep Internetowy'}
          </NavTitle>
        </HeaderBrand>

        <HeaderControls>
          <Button
            unstyled
            onPress={() => navigate('/cart')}
            background="$backgroundHover"
            pressStyle={{ opacity: 0.85 }}
            style={{ borderRadius: 14 }}
          >
            <HeaderIconButton>
              <Text color="$blue10" fontSize="$6" fontWeight="700">S</Text>
              {cartItems > 0 && (
                <HeaderBadge>
                  <Text color="$background" fontSize="$1" fontWeight="800">{cartItems}</Text>
                </HeaderBadge>
              )}
            </HeaderIconButton>
          </Button>

          <Button
            unstyled
            onPress={() => setMenuOpen((current) => !current)}
            pressStyle={{ opacity: 0.85 }}
            background="$backgroundHover"
            style={{ borderRadius: 14 }}
          >
            <HeaderPrimaryIconButton>
              <Text color="$color" fontSize="$5" fontWeight="700">Menu</Text>
            </HeaderPrimaryIconButton>
          </Button>
        </HeaderControls>
      </NavBar>

      {menuOpen && (
        <HeaderMenuWrap style={{ zIndex: 39 }}>
          <HeaderMenuCard>
            <Text fontSize="$6" fontWeight="700" color="$color">Nawigacja</Text>

            <HeaderMenuButton onPress={() => navigate('/')}>
              Strona glowna
            </HeaderMenuButton>

            <HeaderMenuButton onPress={() => navigate('/cart')}>
              Koszyk {cartItems > 0 ? `(${cartItems})` : ''}
            </HeaderMenuButton>

            <Separator my="$2" borderBottomColor="$borderColor" />

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