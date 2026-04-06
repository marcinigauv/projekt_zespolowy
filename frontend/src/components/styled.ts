import { styled, YStack, XStack, Text, Button, Input } from 'tamagui'

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
  pressStyle: { scale: 0.98, opacity: 0.9 },
  width: '100%',
}))

export const ProductVisual = styled(YStack, styles({
  width: '100%',
  height: 168,
  ai: 'center',
  jc: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  $xs: {
    height: 152,
  },
}))

export const ProductInfo = styled(YStack, styles({
  p: '$4',
  gap: '$3',
  $sm: {
    p: '$3',
    gap: '$2',
  },
}))

export const ProductTitle = styled(Text, styles({
  color: '$color',
  fontSize: '$5',
  fontWeight: '700',
  lineHeight: '$5',
}))

export const ProductMetaText = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$3',
  lineHeight: '$3',
}))

export const ProductPrice = styled(Text, styles({
  fontSize: '$7',
  fontWeight: '800',
  color: '$blue10',
  $sm: {
    fontSize: '$6',
  },
}))

export const ProductMetaRow = styled(XStack, styles({
  mt: '$1',
  gap: '$3',
  justifyContent: 'space-between',
  alignItems: 'center',
  $sm: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}))

export const DataRow = styled(XStack, styles({
  gap: '$3',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
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