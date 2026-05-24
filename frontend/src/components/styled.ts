import { styled, YStack, XStack, Text, Button, Input, ScrollView } from 'tamagui'

const styles = <Value,>(value: Value) => value

export const PageWrapper = styled(YStack, styles({
  flex: 1,
  bg: '$background',
}))

export const PageContent = styled(YStack, styles({
  p: 20,
  gap: 24,
  maxWidth: 1120,
  alignSelf: 'center',
  width: '100%',
  $md: {
    p: 20,
    gap: 20,
  },
  $sm: {
    p: 16,
    gap: 16,
  },
  $xs: {
    p: 16,
    pb: 104,
    gap: 14,
  },
}))

export const ProductGrid = styled(YStack, styles({
  p: 20,
  gap: 24,
  maxWidth: 1320,
  alignSelf: 'center',
  width: '100%',
  $lg: {
    p: 20,
    gap: 20,
  },
  $md: {
    p: 20,
    gap: 18,
  },
  $sm: {
    p: 16,
    gap: 16,
  },
  $xs: {
    p: 16,
    pb: 104,
    gap: 14,
  },
}))

export const Section = styled(YStack, styles({
  gap: '$4',
}))

export const SectionHeading = styled(YStack, styles({
  gap: 8,
  maxWidth: 760,
  $xs: {
    gap: 6,
  },
}))

export const Eyebrow = styled(Text, styles({
  color: '$gray11',
  fontFamily: '$mono',
  fontSize: '$2',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: 1.2,
}))

export const SectionTitle = styled(Text, styles({
  color: '$color',
  fontFamily: '$heading',
  fontSize: '$8',
  fontWeight: '700',
  lineHeight: '$8',
  letterSpacing: -0.8,
  $md: {
    fontSize: '$7',
    lineHeight: '$7',
  },
  $sm: {
    fontSize: '$6',
    lineHeight: '$6',
  },
  $xs: {
    fontSize: '$4',
    lineHeight: '$4',
    letterSpacing: -0.6,
  },
  $xxs: {
    fontSize: '$4',
    lineHeight: '$4',
    letterSpacing: -0.5,
  },
}))

export const SectionDescription = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$4',
  lineHeight: '$5',
  maxWidth: 760,
  $sm: {
    fontSize: '$3',
    lineHeight: '$4',
  },
}))

export const SurfaceCard = styled(YStack, styles({
  theme: 'surface',
  bg: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: 20,
  p: 20,
  gap: 14,
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.12,
  shadowRadius: 24,
  elevation: 3,
  $sm: {
    p: 16,
    borderRadius: 18,
  },
  $xs: {
    p: 14,
    borderRadius: 16,
  },
}))

export const ModalBackdrop = styled(YStack, styles({
  flex: 1,
  bg: 'rgba(50,47,53,0.26)',
  px: '$4',
  py: '$5',
  justifyContent: 'center',
  alignItems: 'center',
  $sm: {
    px: '$3',
    py: '$4',
    justifyContent: 'flex-start',
  },
  $xs: {
    px: '$2.5',
    py: '$3.5',
    justifyContent: 'flex-start',
  },
}))

export const ModalCard = styled(SurfaceCard, styles({
  width: '100%',
  maxWidth: 760,
  maxHeight: '100%',
  gap: '$4',
  overflow: 'hidden',
}))

export const ModalHeaderRow = styled(XStack, styles({
  gap: '$3',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}))

export const ModalBodyScroll = styled(ScrollView, styles({
  width: '100%',
  maxHeight: '100%',
}))

export const ToastViewport = styled(YStack, styles({
  position: 'absolute',
  bottom: 0,
  right: 0,
  left: 0,
  pointerEvents: 'box-none',
  zIndex: 30,
}))

export const ToastCardButton = styled(Button, styles({
  bg: 'rgba(253,247,255,0.96)',
  borderWidth: 1,
  borderColor: '#d7cfe1',
  borderRadius: 20,
  px: '$4',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 60,
  shadowColor: 'rgba(79, 55, 138, 0.18)',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.16,
  shadowRadius: 28,
  elevation: 4,
  hoverStyle: {
    bg: '#ffffff',
    borderColor: '#cbc4d2',
  },
  pressStyle: {
    bg: '#f2ecf4',
  },
  $xs: {
    px: '$3',
    py: '$2',
    minHeight: 52,
  },
}))

export const ToastCardWrap = styled(YStack, styles({
  width: '100%',
  position: 'relative',
  alignItems: 'stretch',
  pointerEvents: 'box-none',
}))

export const ToastMarqueeViewport = styled(YStack, styles({
  width: '100%',
  maxWidth: '100%',
  minHeight: 28,
  minWidth: 0,
  overflow: 'hidden',
  justifyContent: 'center',
  alignSelf: 'stretch',
}))

export const ToastTooltip = styled(YStack, styles({
  position: 'absolute',
  right: 24,
  bottom: '100%',
  mt: '$2',
  maxWidth: 420,
  bg: 'rgba(255,255,255,0.98)',
  borderRadius: 18,
  px: '$4',
  py: '$2.5',
  shadowColor: 'rgba(79, 55, 138, 0.18)',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.2,
  shadowRadius: 24,
  elevation: 5,
  borderWidth: 1,
  borderColor: '#d7cfe1',
  pointerEvents: 'none',
  zIndex: 20,
}))

export const ToastText = styled(Text, styles({
  color: '#1d1b20',
  fontSize: '$3',
  fontWeight: '600',
  lineHeight: '$4',
  textAlign: 'left',
  flexShrink: 0,
  hoverStyle: {
    color: '#4f378a',
  },
  variants: {
    hovered: {
      true: {
        color: '#4f378a',
      },
      false: {
        color: '#1d1b20',
      },
    },
  } as const,
  $xs: {
    fontSize: '$2',
    lineHeight: '$3',
  },
}))

export const ToastMetaText = styled(Text, styles({
  color: '#7a7582',
  fontSize: '$2',
  fontWeight: '600',
  textAlign: 'left',
}))

export const ToastTooltipText = styled(Text, styles({
  color: '#1d1b20',
  fontSize: '$2',
  fontWeight: '600',
  lineHeight: '$3',
  textAlign: 'left',
}))

export const CategoryBadge = styled(XStack, styles({
  bg: '$backgroundHover',
  px: '$2.5',
  py: '$1',
  borderRadius: '$10',
  borderWidth: 1,
  borderColor: '$borderColor',
  marginTop: '$1',
  marginBottom: '$1',
}))

export const AuthCenter = styled(YStack, styles({
  flex: 1,
  flexGrow: 1,
  minHeight: 0,
  ai: 'center',
  jc: 'center',
  p: '$6',
  width: '100%',
  $sm: {
    p: '$4',
  },
  $xs: {
    p: '$3',
    pb: 112,
  },
}))

export const AuthForm = styled(YStack, styles({
  width: '100%',
  maxWidth: 480,
  gap: '$4',
}))

export const FormCard = styled(SurfaceCard, styles({
  width: '100%',
  maxWidth: 480,
  alignSelf: 'center',
  p: '$5',
  gap: '$4',
  $sm: {
    p: '$4',
  },
}))

export const WideFormCard = styled(SurfaceCard, styles({
  width: '100%',
  maxWidth: '100%',
  p: '$5',
  gap: '$4',
  $sm: {
    p: '$4',
  },
}))

export const FormField = styled(YStack, styles({
  gap: '$2',
}))

export const FormInput = styled(Input, styles({
  theme: 'surface',
  size: '$4',
  bg: 'transparent',
  borderWidth: 0,
  borderBottomWidth: 2,
  borderColor: '$borderColor',
  color: '$color',
  borderRadius: 0,
  px: '$0',
  pt: '$2.5',
  pb: '$2',
  focusStyle: {
    borderColor: '$outlineColor',
    bg: 'transparent',
  },
  $xs: {
    size: '$3',
    pt: '$2',
    pb: '$1.5',
  },
}))

export const SearchInput = styled(FormInput, styles({
  width: '100%',
  minHeight: 56,
  bg: 'transparent',
  borderWidth: 0,
  borderBottomWidth: 2,
  borderColor: '$borderColor',
  borderRadius: 0,
  px: '$0',
  py: '$2',
}))

export const NavBar = styled(XStack, styles({
  theme: 'surface',
  bg: '$backgroundTransparent',
  minHeight: 64,
  minWidth: 0,
  ai: 'center',
  jc: 'space-between',
  px: 20,
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 24,
  elevation: 4,
  $md: {
    px: 18,
  },
  $sm: {
    minHeight: 60,
    px: 16,
  },
  $xs: {
    minHeight: 56,
    px: 14,
  },
}))

export const NavTitle = styled(Text, styles({
  color: '$color',
  fontFamily: '$heading',
  fontSize: '$6',
  fontWeight: '800',
  letterSpacing: -0.7,
  cursor: 'pointer',
  hoverStyle: {
    color: '$blue10',
  },
  pressStyle: {
    opacity: 0.72,
  },
  $md: {
    fontSize: '$5',
  },
  $xxs: {
    fontSize: '$4',
  },
}))

export const NavLink = styled(Text, styles({
  color: '$gray11',
  fontFamily: '$mono',
  fontSize: '$2',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  cursor: 'pointer',
  hoverStyle: {
    color: '$color',
  },
  pressStyle: {
    opacity: 0.72,
  },
}))

export const HeaderBrand = styled(XStack, styles({
  gap: '$2.5',
  alignItems: 'center',
  flex: 1,
  flexShrink: 1,
  minWidth: 0,
  $xs: {
    gap: '$2',
  },
}))

export const HeaderBrandMark = styled(YStack, styles({
  width: 36,
  height: 36,
  bg: 'rgba(79,55,138,0.08)',
  borderRadius: 999,
  borderWidth: 1,
  borderColor: 'rgba(79,55,138,0.14)',
  alignItems: 'center',
  justifyContent: 'center',
  $sm: {
    width: 32,
    height: 32,
  },
}))

export const HeaderBrandCopy = styled(YStack, styles({
  gap: '$0.5',
  flexShrink: 1,
  minWidth: 0,
}))

export const HeaderMeta = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$2',
  lineHeight: '$2',
}))

export const HeaderInlineNav = styled(XStack, styles({
  flex: 1,
  gap: '$5',
  justifyContent: 'center',
  alignItems: 'center',
  $md: {
    gap: '$4',
  },
}))

export const HeaderControls = styled(XStack, styles({
  gap: '$2',
  alignItems: 'center',
  flexShrink: 0,
  $sm: {
    gap: '$1.5',
  },
  $xxs: {
    gap: '$1',
  },
}))

export const HeaderIconButton = styled(YStack, styles({
  theme: 'surface',
  width: 44,
  height: 44,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '#ffffff',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  $xs: {
    width: 40,
    height: 40,
  },
}))

export const HeaderPrimaryIconButton = styled(YStack, styles({
  width: 44,
  height: 44,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '#ffffff',
  alignItems: 'center',
  justifyContent: 'center',
  $xs: {
    width: 40,
    height: 40,
  },
}))

export const HeaderBadge = styled(YStack, styles({
  bg: '$blue10',
  px: '$1',
  py: '$0.5',
  position: 'absolute',
  top: -5,
  right: -3,
  borderRadius: 999,
  minWidth: 18,
  alignItems: 'center',
  $xxs: {
    top: -3,
    right: -1,
    minWidth: 16,
    px: '$0.5',
  },
}))

export const HeaderMenuWrap = styled(YStack, styles({
  px: '$3',
  pt: '$2.5',
  $xs: {
    px: '$2.5',
  },
}))

export const HeaderMenuCard = styled(SurfaceCard, styles({
  p: '$3.5',
  gap: '$2.5',
  borderRadius: '$7',
}))

export const HeaderMenuButton = styled(Button, styles({
  chromeless: true,
  width: '100%',
  size: '$4',
  justifyContent: 'flex-start',
  cursor: 'pointer',
  px: '$3.5',
  py: '$2.5',
  color: '$color',
  bg: 'transparent',
  borderRadius: '$6',
  hoverStyle: {
    bg: '$backgroundHover',
  },
  pressStyle: {
    bg: '$backgroundPress',
  },
}))

export const PhoneTabsWrap = styled(YStack, styles({
  theme: 'surface',
  bg: '$backgroundTransparent',
  width: '100%',
  alignItems: 'center',
  px: '$2.5',
  pb: '$2',
  pt: '$1.5',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: -10 },
  shadowOpacity: 0.1,
  shadowRadius: 24,
  elevation: 6,
  $xs: {
    px: '$2',
    pt: '$1',
    pb: '$1.5',
  },
}))

export const PhoneTabsRail = styled(XStack, styles({
  theme: 'surface',
  bg: '#ffffff',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: 999,
  p: '$1',
  gap: '$1',
  width: '100%',
  maxWidth: 420,
  alignSelf: 'center',
  $xs: {
    p: '$0.5',
    gap: '$0.5',
  },
}))

export const PhoneTabButton = styled(Button, styles({
  unstyled: true,
  flex: 1,
  minWidth: 0,
  minHeight: 44,
  alignItems: 'center',
  justifyContent: 'center',
  px: '$2',
  py: '$1.5',
  borderRadius: 999,
  hoverStyle: {
    bg: '$backgroundPress',
  },
  pressStyle: {
    bg: '$backgroundPress',
  },
  $xs: {
    minHeight: 40,
    px: '$1.5',
    py: '$1.25',
  },
}))

export const PhoneTabLabel = styled(Text, styles({
  fontSize: '$2',
  lineHeight: '$3',
  fontWeight: '700',
  letterSpacing: 0.2,
  color: '$gray11',
}))

export const PhoneTabBadge = styled(YStack, styles({
  minWidth: 16,
  px: '$1',
  py: '$0.5',
  alignItems: 'center',
  borderRadius: 999,
  bg: '$backgroundStrong',
}))

export const HeaderProfileSurface = styled(YStack, styles({
  theme: 'surface',
  bg: '$background',
}))

export const HeaderProfileSummary = styled(YStack, styles({
  px: '$4',
  py: '$3.5',
  gap: '$1',
}))

export const HeaderProfileRow = styled(XStack, styles({
  gap: '$3',
  alignItems: 'center',
}))

export const HeaderAvatar = styled(YStack, styles({
  width: 42,
  height: 42,
  bg: '$backgroundHover',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$10',
  alignItems: 'center',
  justifyContent: 'center',
}))

export const ProductList = styled(XStack, styles({
  width: '100%',
  flexWrap: 'wrap',
  gap: 16,
  justifyContent: 'flex-start',
  alignContent: 'flex-start',
  alignItems: 'stretch',
  $xs: {
    gap: 12,
  },
  $xxs: {
    gap: 10,
  },
}))

export const ProductListItem = styled(YStack, styles({
  alignSelf: 'stretch',
  width: '48.2%',
  minWidth: 0,
  $gtSm: {
    width: '31.8%',
  },
  $gtLg: {
    width: '23.6%',
  },
  $xxs: {
    width: '100%',
  },
}))

export const ProductCard = styled(YStack, styles({
  theme: 'surface',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$7',
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 3,
  width: '100%',
  height: '100%',
}))

export const CatalogProductCard = styled(YStack, styles({
  theme: 'surface',
  bg: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: 16,
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.11,
  shadowRadius: 20,
  elevation: 3,
  width: '100%',
}))

export const CatalogProductPressable = styled(Button, styles({
  unstyled: true,
  width: '100%',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  cursor: 'pointer',
  hoverStyle: {
    opacity: 1,
  },
  pressStyle: {
    opacity: 0.94,
  },
}))

export const CatalogProductMedia = styled(YStack, styles({
  width: '100%',
  height: 216,
  bg: '$backgroundHover',
  p: 12,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  $md: {
    height: 204,
  },
  $sm: {
    height: 188,
  },
  $xs: {
    height: 164,
    p: 10,
  },
}))

export const CatalogProductMediaFrame = styled(YStack, styles({
  width: '100%',
  height: '100%',
  bg: '#ffffff',
  borderRadius: 14,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
}))

export const CatalogProductBody = styled(YStack, styles({
  width: '100%',
  bg: '$background',
  p: 16,
  gap: 8,
  minHeight: 124,
  $sm: {
    p: 14,
    minHeight: 116,
  },
  $xs: {
    p: 12,
    minHeight: 104,
  },
}))

export const CatalogProductTitle = styled(Text, styles({
  color: '$color',
  fontFamily: '$heading',
  fontSize: '$4',
  lineHeight: '$5',
  fontWeight: '700',
  minHeight: 60,
  height: 60,
  maxHeight: 60,
  $sm: {
    fontSize: '$3',
    lineHeight: '$4',
    minHeight: 48,
    height: 48,
    maxHeight: 48,
  },
}))

export const CatalogProductPriceRow = styled(XStack, styles({
  gap: '$1.5',
  alignItems: 'center',
  flexWrap: 'wrap',
}))

export const CatalogProductDescription = styled(Text, styles({
  color: '$placeholderColor',
  fontFamily: '$mono',
  fontSize: '$2',
  lineHeight: '$3',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  $xs: {
    fontSize: '$1',
    lineHeight: '$2',
  },
}))

export const CatalogProductPrice = styled(Text, styles({
  color: '$blue10',
  fontSize: '$6',
  fontWeight: '700',
  letterSpacing: -0.35,
  $sm: {
    fontSize: '$5',
  },
  $xs: {
    fontSize: '$4',
  },
}))

export const CatalogProductFooter = styled(YStack, styles({
  width: '100%',
  p: '$2',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  bg: '$background',
  $xs: {
    p: '$1.5',
  },
}))

export const ProductCardLinkButton = styled(Button, styles({
  unstyled: true,
  width: '100%',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  cursor: 'pointer',
  hoverStyle: {
    opacity: 0.97,
  },
  pressStyle: {
    opacity: 0.93,
  },
}))

export const ProductVisual = styled(YStack, styles({
  width: '100%',
  height: 168,
  ai: 'center',
  jc: 'center',
  bg: '$backgroundHover',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  $sm: {
    height: 136,
  },
  $xs: {
    height: 112,
  },
}))

export const ProductInfo = styled(YStack, styles({
  width: '100%',
  flex: 1,
  bg: '$background',
}))

export const ProductCardSection = styled(YStack, styles({
  p: '$2.5',
  gap: '$1',
  bg: '$background',
  $sm: {
    p: '$2',
  },
  $xs: {
    p: '$1.5',
  },
}))

export const ProductTitleSection = styled(ProductCardSection, styles({
  minHeight: 62,
  justifyContent: 'center',
  $sm: {
    minHeight: 56,
  },
  $xs: {
    minHeight: 50,
  },
}))

export const ProductCardFooter = styled(YStack, styles({
  p: '$2.5',
  theme: 'surface',
  bg: '$background',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  $xs: {
    p: '$2',
  },
}))

export const ProductTitle = styled(Text, styles({
  color: '$color',
  fontFamily: '$heading',
  fontSize: '$5',
  textAlign: 'left',
  fontWeight: '600',
  lineHeight: '$5',
  $sm: {
    fontSize: '$4',
    lineHeight: '$4',
  },
  $xs: {
    fontSize: '$3',
    lineHeight: '$3',
  },
}))

export const ProductMetaText = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$2',
  lineHeight: '$3',
  $sm: {
    fontSize: '$1',
    lineHeight: '$2',
  },
}))

export const ProductPrice = styled(Text, styles({
  color: '$color',
  fontSize: '$5',
  fontWeight: '700',
  padding: '$1.5',
  borderRadius: '$4',
  $sm: {
    fontSize: '$4',
  },
  $xs: {
    fontSize: '$3',
  },
}))

export const ProductMetaRow = styled(XStack, styles({
  gap: '$2',
  justifyContent: 'flex-start',
  bg: '$background',
}))

export const DataRow = styled(XStack, styles({
  gap: '$2',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
}))

export const SearchRow = styled(XStack, styles({
  gap: 12,
  alignItems: 'stretch',
  flexWrap: 'wrap',
}))

export const ActionButtonRow = styled(XStack, styles({
  gap: '$2',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  alignItems: 'center',
}))

export const BadgeRow = styled(XStack, styles({
  gap: '$2',
  flexWrap: 'wrap',
}))

export const StatusBadge = styled(XStack, styles({
  px: '$2.5',
  py: '$1',
  borderRadius: '$10',
  borderWidth: 1,
  alignItems: 'center',
  alignSelf: 'flex-start',
  variants: {
    tone: {
      neutral: {
        bg: '#f2ecf4',
        borderColor: '#cbc4d2',
      },
      warning: {
        bg: '#ffdf93',
        borderColor: '#e7c365',
      },
      success: {
        bg: '#e9ddff',
        borderColor: '#cfbcff',
      },
      danger: {
        bg: '#ffdad6',
        borderColor: '#f2b8b5',
      },
    },
  } as const,
}))

export const StatusBadgeText = styled(Text, styles({
  fontSize: '$2',
  fontWeight: '700',
  letterSpacing: 0.4,
  variants: {
    tone: {
      neutral: {
        color: '#494551',
      },
      warning: {
        color: '#594400',
      },
      success: {
        color: '#4f378a',
      },
      danger: {
        color: '#93000a',
      },
    },
  } as const,
}))

export const BackLinkButton = styled(Button, styles({
  chromeless: true,
  px: '$0',
  alignSelf: 'flex-start',
}))

export const ProductDetailLayout = styled(XStack, styles({
  gap: '$4',
  flexWrap: 'nowrap',
  alignItems: 'stretch',
  $md: {
    flexDirection: 'column',
    gap: '$3.5',
  },
  $sm: {
    gap: '$3',
  },
}))

export const ProductMediaColumn = styled(YStack, styles({
  theme: 'surface',
  flex: 1,
  minWidth: 320,
  borderRadius: '$8',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '$background',
  $md: {
    minWidth: 0,
    width: '100%',
  },
  $sm: {
    minWidth: 0,
    width: '100%',
  },
}))

export const ProductInfoColumn = styled(YStack, styles({
  flex: 1,
  minWidth: 320,
  gap: '$3',
  $md: {
    minWidth: 0,
    width: '100%',
    gap: '$2.5',
  },
  $sm: {
    minWidth: 0,
    width: '100%',
    gap: '$2.5',
  },
}))

export const ProductHeroMedia = styled(YStack, styles({
  width: '100%',
  height: 420,
  $md: {
    height: 360,
  },
  $sm: {
    height: 300,
  },
  $xs: {
    height: 240,
  },
}))

export const ProductCarouselMedia = styled(ProductVisual, styles({
  height: 162,
  $sm: {
    height: 138,
  },
  $xs: {
    height: 124,
  },
}))

export const ProductImagePlaceholder = styled(YStack, styles({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  theme: 'surface',
  bg: '$backgroundHover',
}))

export const ProductCarouselFrame = styled(YStack, styles({
  theme: 'surface',
  borderRadius: '$8',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '$background',
  height: '100%',
}))

export const CarouselControls = styled(XStack, styles({
  gap: '$2',
  alignItems: 'center',
}))

export const InlineCenter = styled(XStack, styles({
  gap: '$2',
  justifyContent: 'center',
  flexWrap: 'wrap',
}))

export const InlineControls = styled(XStack, styles({
  gap: '$2',
  alignItems: 'center',
}))

export const EmptyStateCard = styled(SurfaceCard, styles({
  py: '$7',
  alignItems: 'center',
  $xs: {
    py: '$6',
  },
}))

export const AdminSectionCard = styled(SurfaceCard, styles({
  gap: '$4',
}))

export const AdminSectionHeader = styled(YStack, styles({
  gap: '$1.5',
}))

export const AdminSectionTitle = styled(Text, styles({
  color: '$color',
  fontFamily: '$heading',
  fontSize: '$6',
  fontWeight: '600',
  letterSpacing: -0.35,
  $sm: {
    fontSize: '$5',
  },
}))

export const AdminHelperText = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$3',
  lineHeight: '$4',
}))

export const AdminFeedbackText = styled(Text, styles({
  fontSize: '$3',
  fontWeight: '600',
  variants: {
    tone: {
      neutral: {
        color: '$placeholderColor',
      },
      success: {
        color: '$blue10',
      },
      danger: {
        color: '$red10',
      },
    },
  } as const,
}))

export const AdminResultsList = styled(YStack, styles({
  gap: '$3',
}))

export const AdminResultCard = styled(SurfaceCard, styles({
  gap: '$3',
  p: '$4',
}))

export const AdminResultSummary = styled(YStack, styles({
  flex: 1,
  gap: '$1.5',
}))

export const AdminResultTitle = styled(Text, styles({
  color: '$color',
  fontSize: '$5',
  fontWeight: '700',
  lineHeight: '$5',
}))

export const AdminResultMeta = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$3',
  lineHeight: '$3',
}))

export const AdminResultValue = styled(Text, styles({
  color: '$color',
  fontSize: '$3',
  fontWeight: '600',
  lineHeight: '$3',
}))

export const AdminResultValueRight = styled(Text, styles({
  color: '$color',
  fontSize: '$3',
  fontWeight: '600',
  lineHeight: '$3',
  textAlign: 'right',
  flexShrink: 1,
}))

export const PrimaryButton = styled(Button, styles({
  theme: 'brand',
  size: '$4',
  px: '$5',
  py: '$2',
  fontFamily: '$mono',
  fontSize: '$2',
  fontWeight: '700',
  letterSpacing: 0.6,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 20,
  minHeight: 56,
  pressStyle: {
    opacity: 1,
    bg: '$backgroundPress',
  },
  hoverStyle: {
    opacity: 1,
    bg: '$backgroundHover',
  },
  $sm: {
    size: '$4',
    px: '$4',
  },
  $xs: {
    width: '100%',
    px: '$3.5',
  },
}))

export const AddToCartButton = styled(Button, styles({
  bg: '#4f378a',
  color: '#ffffff',
  size: '$4',
  px: '$5',
  py: '$2',
  fontFamily: '$mono',
  fontSize: '$2',
  fontWeight: '700',
  letterSpacing: 0.6,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: '#4f378a',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  minHeight: 56,
  pressStyle: {
    opacity: 1,
    bg: '#43306f',
  },
  hoverStyle: {
    opacity: 1,
    bg: '#6750a4',
  },
  $sm: {
    size: '$3',
    px: '$3',
    py: '$1.5',
  },
  $xs: {
    width: '100%',
  },
}))

export const ProductCardAddButton = styled(AddToCartButton, styles({
  width: '100%',
}))

export const SecondaryButton = styled(Button, styles({
  theme: 'surface',
  borderWidth: 1,
  size: '$4',
  px: '$5',
  py: '$2',
  fontFamily: '$mono',
  fontSize: '$2',
  fontWeight: '700',
  letterSpacing: 0.6,
  borderRadius: 999,
  borderColor: '$borderColor',
  bg: '#ffffff',
  color: '$color',
  minHeight: 56,
  hoverStyle: {
    bg: '$backgroundHover',
  },
  pressStyle: {
    bg: '$backgroundPress',
  },
  $xs: {
    size: '$3',
  },
}))

export const GhostDangerButton = styled(Button, styles({
  chromeless: true,
  color: '$red10',
  fontWeight: '700',
  borderRadius: 999,
}))