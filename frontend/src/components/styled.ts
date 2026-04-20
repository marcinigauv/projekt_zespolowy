import { styled, YStack, XStack, Text, Button, Input, ScrollView } from 'tamagui'

const styles = <Value,>(value: Value) => value

export const PageWrapper = styled(YStack, styles({
  flex: 1,
  bg: '$background',
}))

export const PageContent = styled(YStack, styles({
  p: '$5',
  gap: '$5',
  maxWidth: 860,
  alignSelf: 'center',
  width: '100%',
  $sm: {
    p: '$3',
    gap: '$4',
  },
  $xs: {
    p: '$2.5',
    gap: '$3',
  },
}))

export const ProductGrid = styled(YStack, styles({
  p: '$5',
  gap: '$5',
  maxWidth: 1240,
  alignSelf: 'center',
  width: '100%',
  $md: {
    p: '$4',
    gap: '$4',
  },
  $sm: {
    p: '$3',
    gap: '$4',
  },
  $xs: {
    p: '$2.5',
    gap: '$3',
  },
}))

export const Section = styled(YStack, styles({
  gap: '$4',
}))

export const SectionHeading = styled(YStack, styles({
  gap: '$2',
}))

export const Eyebrow = styled(Text, styles({
  color: '$blue10',
  fontSize: '$2',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: 1.2,
}))

export const SectionTitle = styled(Text, styles({
  color: '$color',
  fontSize: '$9',
  fontWeight: '800',
  letterSpacing: -0.8,
  lineHeight: '$9',
  $md: {
    fontSize: '$8',
    lineHeight: '$8',
  },
  $sm: {
    fontSize: '$7',
    lineHeight: '$7',
  },
  $xs: {
    fontSize: '$6',
    lineHeight: '$6',
  },
}))

export const SectionDescription = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$4',
  lineHeight: '$4',
  maxWidth: 720,
  $sm: {
    fontSize: '$3',
    lineHeight: '$3',
  },
}))

export const SurfaceCard = styled(YStack, styles({
  bg: '#ffffff',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$8',
  p: '$4',
  gap: '$3',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 18,
  elevation: 2,
  $xs: {
    p: '$3',
  },
}))

export const ModalBackdrop = styled(YStack, styles({
  flex: 1,
  bg: 'rgba(15, 23, 42, 0.42)',
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
    py: '$3',
  },
}))

export const ModalCard = styled(SurfaceCard, styles({
  width: '100%',
  maxWidth: 720,
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
  top: 88,
  right: '$4',
  left: '$4',
  gap: '$2.5',
  alignItems: 'flex-end',
  pointerEvents: 'box-none',
  zIndex: 30,
}))

export const ToastCardButton = styled(Button, styles({
  width: '100%',
  maxWidth: 360,
  bg: '#edf4fb',
  borderWidth: 1,
  borderColor: '#c9d9ea',
  borderRadius: '$8',
  px: '$3.5',
  py: '$3',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  shadowColor: 'rgba(58, 90, 122, 0.22)',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 20,
  elevation: 3,
}))

export const ToastCardWrap = styled(YStack, styles({
  width: '100%',
  maxWidth: 360,
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
  right: 0,
  top: '100%',
  mt: '$2',
  maxWidth: 420,
  bg: '#17324b',
  borderRadius: '$6',
  px: '$3',
  py: '$2.5',
  shadowColor: 'rgba(9, 19, 29, 0.28)',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.18,
  shadowRadius: 24,
  elevation: 4,
  pointerEvents: 'none',
  zIndex: 20,
}))

export const ToastText = styled(Text, styles({
  color: '#23425f',
  fontSize: '$3',
  fontWeight: '600',
  lineHeight: '$4',
  textAlign: 'left',
  flexShrink: 0,
}))

export const ToastMetaText = styled(Text, styles({
  color: '#5f7992',
  fontSize: '$2',
  fontWeight: '600',
  textAlign: 'left',
}))

export const ToastTooltipText = styled(Text, styles({
  color: '#f3f8fc',
  fontSize: '$2',
  fontWeight: '600',
  lineHeight: '$3',
  textAlign: 'left',
}))

export const CategoryBadge = styled(XStack, styles({
  bg: '$blue2',
  px: '$2.5',
  py: '$1',
  borderRadius: '$10',
  borderWidth: 1,
  borderColor: '$blue4',
}))

export const AuthCenter = styled(YStack, styles({
  flex: 1,
  flexGrow: 1,
  minHeight: 0,
  ai: 'center',
  jc: 'center',
  p: '$5',
  width: '100%',
  $sm: {
    p: '$3',
  },
}))

export const AuthForm = styled(YStack, styles({
  width: '100%',
  maxWidth: 440,
  gap: '$4',
}))

export const FormCard = styled(SurfaceCard, styles({
  width: '100%',
  maxWidth: 440,
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
  size: '$4',
  bg: '#ffffff',
  borderColor: '$borderColor',
  color: '$color',
  borderRadius: '$6',
  px: '$3',
  focusStyle: {
    borderColor: '$outlineColor',
  },
}))

export const SearchInput = styled(FormInput, styles({
  width: '100%',
}))

export const NavBar = styled(XStack, styles({
  bg: '#ffffff',
  minHeight: 72,
  ai: 'center',
  jc: 'space-between',
  px: '$4',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 20,
  elevation: 3,
  $md: {
    px: '$3.5',
  },
  $sm: {
    minHeight: 64,
    px: '$3',
  },
}))

export const NavTitle = styled(Text, styles({
  color: '$color',
  fontSize: '$6',
  fontWeight: '800',
  letterSpacing: -0.3,
  pressStyle: { opacity: 0.7 },
  $md: {
    fontSize: '$5',
  },
  $sm: {
    fontSize: '$5',
  },
}))

export const NavLink = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$4',
  fontWeight: '600',
  pressStyle: { opacity: 0.7 },
}))

export const HeaderBrand = styled(XStack, styles({
  gap: '$3',
  alignItems: 'center',
  flexShrink: 1,
}))

export const HeaderBrandMark = styled(YStack, styles({
  width: 36,
  height: 36,
  bg: '$blue9',
  borderRadius: '$6',
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
  gap: '$4',
  alignItems: 'center',
  $md: {
    gap: '$3',
  },
  $sm: {
    gap: '$2',
  },
}))

export const HeaderIconButton = styled(YStack, styles({
  width: 42,
  height: 42,
  borderRadius: '$7',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '#f3f6fa',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
}))

export const HeaderPrimaryIconButton = styled(YStack, styles({
  width: 42,
  height: 42,
  borderRadius: '$7',
  bg: '$blue9',
  alignItems: 'center',
  justifyContent: 'center',
}))

export const HeaderBadge = styled(YStack, styles({
  background: '$red9',
  px: '$1.5',
  py: '$0.5',
  position: 'absolute',
  top: -6,
  right: -4,
  borderRadius: 999,
  minWidth: 20,
  alignItems: 'center',
}))

export const HeaderMenuWrap = styled(YStack, styles({
  px: '$3',
  pt: '$2',
  $xs: {
    px: '$2.5',
  },
}))

export const HeaderMenuCard = styled(SurfaceCard, styles({
  p: '$3',
  gap: '$2',
  borderRadius: '$8',
}))

export const HeaderMenuButton = styled(Button, styles({
  chromeless: true,
  size: '$5',
  justifyContent: 'flex-start',
  px: '$4',
  py: '$3',
}))

export const HeaderProfileSurface = styled(YStack, styles({
  bg: '#ffffff',
}))

export const HeaderProfileSummary = styled(YStack, styles({
  px: '$4',
  py: '$3',
  gap: '$1',
}))

export const HeaderProfileRow = styled(XStack, styles({
  gap: '$3',
  alignItems: 'center',
}))

export const HeaderAvatar = styled(YStack, styles({
  width: 40,
  height: 40,
  bg: '$blue9',
  borderRadius: '$10',
  alignItems: 'center',
  justifyContent: 'center',
}))

export const ProductList = styled(XStack, styles({
  flexWrap: 'wrap',
  gap: '$4',
  justifyContent: 'space-between',
  $xs: {
    gap: '$3',
  },
}))

export const ProductListItem = styled(YStack, styles({
  width: '100%',
  $gtXs: {
    width: '48%',
    minWidth: 240,
  },
  $gtMd: {
    width: '31.5%',
  },
  $gtLg: {
    width: '24%',
  },
}))

export const ProductCard = styled(YStack, styles({
  bg: '#ffffff',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$8',
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 18,
  elevation: 2,
  width: '100%',
}))

export const ProductCardLinkButton = styled(Button, styles({
  unstyled: true,
  width: '100%',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  pressStyle: { opacity: 0.92 },
}))

export const ProductVisual = styled(YStack, styles({
  width: '100%',
  height: 168,
  ai: 'center',
  jc: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  $sm: {
    height: 148,
  },
}))

export const ProductInfo = styled(YStack, styles({
  width: '100%',
}))

export const ProductCardSection = styled(YStack, styles({
  p: '$3',
  gap: '$1.5',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  $sm: {
    p: '$2.5',
  },
}))

export const ProductCardFooter = styled(YStack, styles({
  p: '$3',
  bg: '#ffffff',
}))

export const ProductTitle = styled(Text, styles({
  color: '$color',
  fontSize: '$5',
  fontWeight: '700',
  lineHeight: '$5',
  $sm: {
    fontSize: '$4',
    lineHeight: '$4',
  },
}))

export const ProductMetaText = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$3',
  lineHeight: '$3',
  $sm: {
    fontSize: '$2',
    lineHeight: '$2',
  },
}))

export const ProductPrice = styled(Text, styles({
  fontSize: '$6',
  fontWeight: '800',
  color: '$blue10',
  $sm: {
    fontSize: '$5',
  },
}))

export const ProductMetaRow = styled(XStack, styles({
  gap: '$2',
  justifyContent: 'flex-start',
  alignItems: 'center',
}))

export const DataRow = styled(XStack, styles({
  gap: '$3',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
}))

export const SearchRow = styled(XStack, styles({
  gap: '$3',
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
        bg: '#eef3f8',
        borderColor: '#d7e0ea',
      },
      warning: {
        bg: '#fff6e5',
        borderColor: '#ffd591',
      },
      success: {
        bg: '#eaf9ef',
        borderColor: '#9dd8a8',
      },
      danger: {
        bg: '#fdeeee',
        borderColor: '#f0b6b6',
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
        color: '#425466',
      },
      warning: {
        color: '#9a5b00',
      },
      success: {
        color: '#186a3b',
      },
      danger: {
        color: '#a43c3c',
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
  gap: '$5',
  flexWrap: 'wrap',
}))

export const ProductMediaColumn = styled(YStack, styles({
  flex: 1,
  minWidth: 280,
  borderRadius: '$8',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '#ffffff',
}))

export const ProductInfoColumn = styled(YStack, styles({
  flex: 1,
  minWidth: 280,
  gap: '$4',
}))

export const ProductHeroMedia = styled(YStack, styles({
  width: '100%',
  height: 420,
}))

export const ProductCarouselMedia = styled(YStack, styles({
  width: '100%',
  height: 240,
}))

export const ProductImagePlaceholder = styled(YStack, styles({
  flex: 1,
  ai: 'center',
  jc: 'center',
  bg: '#eef3f8',
}))

export const ProductCarouselFrame = styled(YStack, styles({
  borderRadius: '$8',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '#ffffff',
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
  py: '$8',
  alignItems: 'center',
}))

export const AdminSectionCard = styled(SurfaceCard, styles({
  gap: '$4',
}))

export const AdminSectionHeader = styled(YStack, styles({
  gap: '$1.5',
}))

export const AdminSectionTitle = styled(Text, styles({
  color: '$color',
  fontSize: '$6',
  fontWeight: '800',
  letterSpacing: -0.3,
  $sm: {
    fontSize: '$5',
  },
}))

export const AdminHelperText = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$3',
  lineHeight: '$3',
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
        color: '#186a3b',
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
  p: '$3.5',
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
}))

export const PrimaryButton = styled(Button, styles({
  theme: 'brand',
  size: '$5',
  px: '$6',
  borderRadius: '$10',
  fontWeight: '700',
  shadowColor: 'rgba(31, 75, 143, 0.18)',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  $xs: {
    width: '100%',
  },
}))

export const AddToCartButton = styled(Button, styles({
  theme: 'accent',
  px: '$4',
  py: '$2',
  fontSize: '$4',
  fontWeight: '600',
  borderRadius: '$8',
  $xs: {
    width: '100%',
  },
}))

export const ProductCardAddButton = styled(AddToCartButton, styles({
  width: '100%',
}))

export const SecondaryButton = styled(Button, styles({
  bg: '#ffffff',
  color: '$color',
  borderWidth: 1,
  borderColor: '$borderColor',
  size: '$5',
  borderRadius: '$10',
  fontWeight: '700',
}))

export const GhostDangerButton = styled(Button, styles({
  chromeless: true,
  color: '$red10',
  fontWeight: '700',
}))