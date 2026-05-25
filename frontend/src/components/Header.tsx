import React, { useEffect, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { XStack, YStack, Text, Button, Popover, Separator } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { logoutUserUseCase } from '../auth/useCases'
import { NotificationsToastHost } from './NotificationsToastHost'
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
  HeaderPrimaryIconButton,
  PhoneTabBadge,
  PhoneTabButton,
  PhoneTabsRail,
  PhoneTabsWrap,
  HeaderProfileRow,
  HeaderProfileSummary,
  HeaderProfileSurface,
  NavBar,
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
          Historia zamówień
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
              Zarządzanie Przedmiotami
            </HeaderMenuButton>
          </>
        ) : null}
        <HeaderMenuButton onPress={handleLogout}>
          <Text color="$red10">Wyloguj się</Text>
        </HeaderMenuButton>
      </HeaderProfileSurface>
    )
  }

  return (
    <HeaderProfileSurface width="90%" style={{ paddingTop: 12, paddingBottom: 12 }}>
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
  const pathname = usePathname()
  const { width: viewportWidth } = useWindowDimensions()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const cartItems = useCartStore((state) => state.getTotalItems())
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isWeb = Platform.OS === 'web'
  const isDesktop = viewportWidth > 768
  const isPhone = viewportWidth <= 520
  const isWideDesktop = viewportWidth > 1024
  const isCompactMobile = viewportWidth <= 390
  const navBarStyle = isWeb && !isPhone
    ? { position: 'sticky' as const, top: 0, zIndex: 40, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }
    : undefined
  const phoneHeaderStyle = isWeb && isPhone
    ? { position: 'sticky' as const, top: 0, zIndex: 40, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }
    : undefined
  const accountPath = isAuthenticated ? '/profile' : '/login'
  const isAccountActive = pathname.startsWith('/profile') || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/admin')
  const iconTriggerStyle = {
    borderRadius: 999,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  } as const
  const phoneTabs: Array<{
    key: string
    icon: React.ComponentProps<typeof MaterialIcons>['name']
    ariaLabel: string
    path: string
    active: boolean
    badge?: number | null
  }> = [
    {
      key: 'home',
      icon: 'home',
      ariaLabel: 'Strona główna',
      path: '/',
      active: pathname === '/',
    },
    {
      key: 'cart',
      icon: 'shopping-cart',
      ariaLabel: 'Koszyk',
      path: '/cart',
      active: pathname === '/cart',
      badge: cartItems > 0 ? cartItems : null,
    },
    {
      key: 'account',
      icon: isAuthenticated ? 'person' : 'login',
      ariaLabel: isAuthenticated ? 'Konto' : 'Logowanie',
      path: accountPath,
      active: isAccountActive,
    },
  ]
  const phoneTabsStyle = isWeb
    ? {
        position: 'absolute' as const,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 45,
      }
    : undefined

  if (isAuthenticated) {
    phoneTabs.splice(2, 0, {
      key: 'orders',
      icon: 'receipt-long',
      ariaLabel: 'Zamówienia',
      path: '/orders',
      active: pathname === '/orders' || pathname.startsWith('/orders/'),
    })

    if (user?.isAdmin) {
      phoneTabs.splice(3, 0, {
        key: 'admin',
        icon: 'inventory-2',
        ariaLabel: 'Admin',
        path: '/admin/products',
        active: pathname.startsWith('/admin'),
      })
    }
  }

  useEffect(() => {
    if (isDesktop || isPhone) {
      setMenuOpen(false)
    }
  }, [isDesktop, isPhone])

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
            <Text color="$blue10" fontFamily="$mono" fontSize="$2" fontWeight="700">
              SI
            </Text>
          </HeaderBrandMark>
          <HeaderBrandCopy>
            <NavTitle aria-label="Przejdz do strony glownej" onPress={() => router.push('/')} numberOfLines={1}>
              {isWideDesktop ? 'Sklep Internetowy' : 'Sklep'}
            </NavTitle>
          </HeaderBrandCopy>
        </HeaderBrand>

        <XStack flex={1} />

        <HeaderControls>
          <Button
            unstyled
            aria-label="Koszyk"
            onPress={() => navigate('/cart')}
            pressStyle={{ opacity: 0.75 }}
            style={iconTriggerStyle}
          >
            <HeaderIconButton>
              <MaterialIcons name="shopping-cart" size={20} color="#4f378a" />
              {cartItems > 0 && (
                <HeaderBadge>
                  <Text color="#ffffff" fontSize="$1" fontWeight="800">
                    {cartItems}
                  </Text>
                </HeaderBadge>
              )}
            </HeaderIconButton>
          </Button>

          <Popover open={profileOpen} onOpenChange={setProfileOpen} placement="bottom-end">
            <Popover.Trigger>
              <Button
                unstyled
                aria-label="Profil"
                pressStyle={{ opacity: 0.8 }}
                style={iconTriggerStyle}
              >
                <HeaderPrimaryIconButton>
                  <MaterialIcons name={isAuthenticated ? 'person' : 'login'} size={20} color="#1d1b20" />
                </HeaderPrimaryIconButton>
              </Button>
            </Popover.Trigger>
            <Popover.Content
              bg="#ffffff"
              bordered
              elevate
              p={0}
              shadowRadius={20}
              shadowOffset={{ width: 0, height: 10 }}
              style={{ minWidth: 250, borderRadius: 20 }}
            >
              <ProfileMenu onClose={() => setProfileOpen(false)} />
            </Popover.Content>
          </Popover>
        </HeaderControls>
      </NavBar>
    )
  }

  if (isPhone) {
    return (
      <>
        <YStack style={phoneHeaderStyle}>
          <NavBar>
            <HeaderBrand>
              <HeaderBrandMark>
                <Text color="$blue10" fontFamily="$mono" fontSize="$2" fontWeight="700">
                  SI
                </Text>
              </HeaderBrandMark>
              <HeaderBrandCopy>
                <NavTitle
                  aria-label="Przejdz do strony glownej"
                  onPress={() => navigate('/')}
                  numberOfLines={1}
                  style={{ flexShrink: 1 }}
                >
                  Sklep
                </NavTitle>
              </HeaderBrandCopy>
            </HeaderBrand>

            <HeaderControls>
              <Button
                unstyled
                aria-label="Koszyk"
                onPress={() => navigate('/cart')}
                pressStyle={{ opacity: 0.8 }}
                style={iconTriggerStyle}
              >
                <HeaderIconButton>
                  <MaterialIcons name="shopping-cart" size={19} color="#4f378a" />
                  {cartItems > 0 && (
                    <HeaderBadge>
                      <Text color="#ffffff" fontSize="$1" fontWeight="800">{cartItems}</Text>
                    </HeaderBadge>
                  )}
                </HeaderIconButton>
              </Button>
            </HeaderControls>
          </NavBar>

          {isWeb ? <NotificationsToastHost placement="inline" /> : null}
        </YStack>

        <PhoneTabsWrap style={phoneTabsStyle}>
          <PhoneTabsRail>
            {phoneTabs.map((tab) => (
              <PhoneTabButton
                key={tab.key}
                aria-label={tab.ariaLabel}
                onPress={() => navigate(tab.path)}
                bg={tab.active ? '#4f378a' : 'transparent'}
                hoverStyle={{ bg: tab.active ? '#4f378a' : '$backgroundPress' }}
                pressStyle={{ bg: tab.active ? '#4f378a' : '$backgroundPress' }}
              >
                <YStack style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <MaterialIcons
                    name={tab.icon}
                    size={18}
                    color={tab.active ? '#ffffff' : '#494551'}
                  />
                  {tab.badge ? (
                    <PhoneTabBadge
                      bg={tab.active ? '#ffffff' : '$backgroundStrong'}
                      style={{ position: 'absolute', top: -8, right: -12 }}
                    >
                      <Text color={tab.active ? '#4f378a' : '$color'} fontSize="$1" fontWeight="800">
                        {tab.badge}
                      </Text>
                    </PhoneTabBadge>
                  ) : null}
                </YStack>
              </PhoneTabButton>
            ))}
          </PhoneTabsRail>
        </PhoneTabsWrap>
      </>
    )
  }

  return (
    <>
      <NavBar style={navBarStyle}>
        <HeaderBrand>
          <HeaderBrandMark>
            <Text color="$blue10" fontFamily="$mono" fontSize="$2" fontWeight="700">
              SI
            </Text>
          </HeaderBrandMark>
          <HeaderBrandCopy>
            <NavTitle
              aria-label="Przejdz do strony glownej"
              onPress={() => navigate('/')}
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >
              {isCompactMobile ? 'Sklep' : 'Sklep Internetowy'}
            </NavTitle>
          </HeaderBrandCopy>
        </HeaderBrand>

        <HeaderControls>
          <Button
            unstyled
            aria-label="Koszyk"
            onPress={() => navigate('/cart')}
            pressStyle={{ opacity: 0.85 }}
            style={iconTriggerStyle}
          >
            <HeaderIconButton>
              <MaterialIcons name="shopping-cart" size={19} color="#4f378a" />
              {cartItems > 0 && (
                <HeaderBadge>
                  <Text color="#ffffff" fontSize="$1" fontWeight="800">{cartItems}</Text>
                </HeaderBadge>
              )}
            </HeaderIconButton>
          </Button>

          <Button
            unstyled
            onPress={() => setMenuOpen((current) => !current)}
            aria-label="Menu"
            pressStyle={{ opacity: 0.85 }}
            style={iconTriggerStyle}
          >
            <HeaderPrimaryIconButton>
              <MaterialIcons name="menu" size={20} color="#1d1b20" />
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