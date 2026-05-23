import { styled, YStack, XStack, Text, Button, Input, ScrollView } from 'tamagui'

const styles = <Value,>(value: Value) => value

export const PageWrapper = styled(YStack, styles({
  flex: 1,
  bg: '$background',
}))

export const PageContent = styled(YStack, styles({
  p: '$6',
  gap: '$5',
  maxWidth: 980,
  alignSelf: 'center',
  width: '100%',
  $md: {
    p: '$5',
    gap: '$4',
  },
  $sm: {
    p: '$3',
    gap: '$3',
  },
  $xs: {
    p: '$2.5',
    gap: '$2.5',
  },
}))

export const ProductGrid = styled(YStack, styles({
  p: '$6',
  gap: '$5',
  maxWidth: 1320,
  alignSelf: 'center',
  width: '100%',
  $lg: {
    p: '$5',
    gap: '$4',
  },
  $md: {
    p: '$4',
    gap: '$3',
  },
  $sm: {
    p: '$3',
    gap: '$2.5',
  },
  $xs: {
    p: '$2.5',
    gap: '$2',
  },
}))

export const Section = styled(YStack, styles({
  gap: '$4',
}))

export const SectionHeading = styled(YStack, styles({
  gap: '$2',
  maxWidth: 700,
}))

export const Eyebrow = styled(Text, styles({
  color: '$gray11',
  fontSize: '$2',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: 1.4,
}))

export const SectionTitle = styled(Text, styles({
  color: '$color',
  fontFamily: '$heading',
  fontSize: '$8',
  fontWeight: '600',
  lineHeight: '$8',
  letterSpacing: -0.9,
  $md: {
    fontSize: '$7',
    lineHeight: '$7',
  },
  $sm: {
    fontSize: '$6',
    lineHeight: '$6',
  },
  $xs: {
    fontSize: '$5',
    lineHeight: '$5',
  },
  $xxs: {
    fontSize: '$4',
    lineHeight: '$4',
  },
}))

export const SectionDescription = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$3',
  lineHeight: '$4',
  maxWidth: 760,
  $sm: {
    fontSize: '$2',
    lineHeight: '$3',
  },
}))

export const SurfaceCard = styled(YStack, styles({
  theme: 'surface',
  bg: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$7',
  p: '$4',
  gap: '$3',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 3,
  $sm: {
    p: '$3',
    borderRadius: '$6',
  },
  $xs: {
    p: '$2.5',
    borderRadius: '$5',
  },
}))

export const ModalBackdrop = styled(YStack, styles({
  flex: 1,
  bg: 'rgba(23,35,32,0.34)',
  px: '$4',
  py: '$5',
  justifyContent: 'center',
  alignItems: 'center',
  $sm: {
    px: '$3',
    py: '$4',
  },
  $xs: {
    px: '$2.5',
    py: '$3.5',
  },
}))

export const ModalCard = styled(SurfaceCard, styles({
  width: '100%',
  maxWidth: 760,
  maxHeight: '100%',
  gap: '$4',
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
  width: '100%',
  bg: '#253633',
  borderWidth: 1,
  borderColor: '#3f5752',
  borderRadius: '$0',
  px: '$3.5',
  py: '$3',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  shadowColor: 'rgba(8,14,13,0.32)',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.18,
  shadowRadius: 28,
  elevation: 4,
  hoverStyle: {
    bg: '#2f4340',
    borderColor: '#4b6661',
  },
  pressStyle: {
    bg: '#1f2d2b',
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
  minHeight: 24,
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
  bg: '#1f2d2b',
  borderRadius: '$6',
  px: '$4',
  py: '$2.5',
  shadowColor: 'rgba(8,14,13,0.34)',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.2,
  shadowRadius: 24,
  elevation: 5,
  pointerEvents: 'none',
  zIndex: 20,
}))

export const ToastText = styled(Text, styles({
  color: '#f6fbf8',
  fontSize: '$3',
  fontWeight: '600',
  lineHeight: '$4',
  textAlign: 'left',
  flexShrink: 0,
  hoverStyle: {
    color: '#f4eade',
  },
  variants: {
    hovered: {
      true: {
        color: '#f4eade',
      },
      false: {
        color: '#f6fbf8',
      },
    },
  } as const,
  $xs: {
    fontSize: '$2',
    lineHeight: '$3',
  },
}))

export const ToastMetaText = styled(Text, styles({
  color: '#afc3be',
  fontSize: '$2',
  fontWeight: '600',
  textAlign: 'left',
}))

export const ToastTooltipText = styled(Text, styles({
  color: '#e8f1ed',
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
  bg: '$background',
  borderColor: '$borderColor',
  color: '$color',
  borderRadius: '$6',
  px: '$3.5',
  focusStyle: {
    borderColor: '$outlineColor',
    bg: '$background',
  },
  $xs: {
    size: '$3',
    px: '$3',
  },
}))

export const SearchInput = styled(FormInput, styles({
  width: '100%',
}))

export const NavBar = styled(XStack, styles({
  theme: 'surface',
  bg: '$background',
  minHeight: 72,
  minWidth: 0,
  ai: 'center',
  jc: 'space-between',
  px: '$4',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 4,
  $md: {
    px: '$3.5',
  },
  $sm: {
    minHeight: 60,
    px: '$3',
  },
}))

export const NavTitle = styled(Text, styles({
  color: '$color',
  fontFamily: '$heading',
  fontSize: '$6',
  fontWeight: '600',
  letterSpacing: -0.4,
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
  fontSize: '$4',
  fontWeight: '600',
  cursor: 'pointer',
  hoverStyle: {
    color: '$color',
  },
  pressStyle: {
    opacity: 0.72,
  },
}))

export const HeaderBrand = styled(XStack, styles({
  gap: '$3',
  alignItems: 'center',
  flex: 1,
  flexShrink: 1,
  minWidth: 0,
  $xs: {
    gap: '$2',
  },
}))

export const HeaderBrandMark = styled(YStack, styles({
  width: 40,
  height: 40,
  bg: '$backgroundStrong',
  borderRadius: '$15',
  borderWidth: 1,
  borderColor: '$borderColor',
  alignItems: 'center',
  justifyContent: 'center',
  $sm: {
    width: 30,
    height: 30,
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
  width: 38,
  height: 38,
  borderRadius: '$6',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '$backgroundHover',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
}))

export const HeaderPrimaryIconButton = styled(YStack, styles({
  width: 38,
  height: 38,
  borderRadius: '$6',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '$backgroundHover',
  alignItems: 'center',
  justifyContent: 'center',
}))

export const HeaderBadge = styled(YStack, styles({
  bg: '$brand.background',
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
  bg: '$background',
  px: '$2.5',
  pb: '$2',
  pt: '$1.5',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
}))

export const PhoneTabsRail = styled(XStack, styles({
  theme: 'surface',
  bg: '$backgroundHover',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$10',
  p: '$1',
  gap: '$1',
  width: '100%',
}))

export const PhoneTabButton = styled(Button, styles({
  unstyled: true,
  flex: 1,
  minWidth: 0,
  alignItems: 'center',
  justifyContent: 'center',
  px: '$2',
  py: '$1.5',
  borderRadius: '$8',
  hoverStyle: {
    bg: '$backgroundPress',
  },
  pressStyle: {
    bg: '$backgroundPress',
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
  flexWrap: 'wrap',
  gap: '$3',
  justifyContent: 'space-between',
  $xs: {
    gap: '$2',
  },
}))

export const ProductListItem = styled(YStack, styles({
  width: '100%',
  $xs: {
    width: '48.5%',
  },
  $gtXs: {
    width: '49%',
    minWidth: 220,
  },
  $gtMd: {
    width: '32%',
  },
  $gtLg: {
    width: '24%',
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
}))

export const ProductCardLinkButton = styled(Button, styles({
  unstyled: true,
  width: '100%',
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
  height: 62,
  justifyContent: 'center',
  $sm: {
    height: 56,
  },
  $xs: {
    height: 50,
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
  minHeight: 48,
  $sm: {
    fontSize: '$4',
    lineHeight: '$4',
    minHeight: 40,
  },
  $xs: {
    fontSize: '$3',
    lineHeight: '$3',
    minHeight: 32,
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
  gap: '$2',
  alignItems: 'center',
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
        bg: '#ecf2ed',
        borderColor: '#d5e1d7',
      },
      warning: {
        bg: '#f4ede2',
        borderColor: '#e1d0b4',
      },
      success: {
        bg: '#e6f1e8',
        borderColor: '#c4d7c8',
      },
      danger: {
        bg: '#f3e6e8',
        borderColor: '#e0c2c7',
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
        color: '#4b5d58',
      },
      warning: {
        color: '#6b573d',
      },
      success: {
        color: '#355a45',
      },
      danger: {
        color: '#7a3d46',
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
  flexWrap: 'wrap',
  $sm: {
    gap: '$3',
  },
}))

export const ProductMediaColumn = styled(YStack, styles({
  theme: 'surface',
  flex: 1,
  minWidth: 250,
  borderRadius: '$8',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '$background',
  $sm: {
    minWidth: 0,
    width: '100%',
  },
}))

export const ProductInfoColumn = styled(YStack, styles({
  flex: 1,
  minWidth: 250,
  gap: '$3',
  $sm: {
    minWidth: 0,
    width: '100%',
    gap: '$2.5',
  },
}))

export const ProductHeroMedia = styled(YStack, styles({
  width: '100%',
  height: 400,
  $sm: {
    height: 280,
  },
  $xs: {
    height: 220,
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
        color: '#356c4c',
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
  fontWeight: '700',
  borderRadius: '$6',
  borderWidth: 1,
  borderColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 20,
  pressStyle: {
    opacity: 0.9,
  },
  hoverStyle: {
    opacity: 0.96,
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
  theme: 'accent',
  size: '$4',
  px: '$3.5',
  py: '$1.5',
  fontSize: '$3',
  fontWeight: '700',
  borderRadius: '$6',
  borderWidth: 1,
  borderColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  pressStyle: {
    opacity: 0.9,
  },
  hoverStyle: {
    opacity: 0.96,
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
  fontWeight: '700',
  borderRadius: '$6',
  borderColor: '$borderColor',
  bg: '$background',
  color: '$color',
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
  borderRadius: '$6',
}))