import { styled, YStack, XStack, Text, Button, Input } from 'tamagui'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s = (v: any) => v

export const PageWrapper = styled(YStack, s({
  flex: 1,
  bg: '$background',
}))

export const PageContent = styled(YStack, s({
  p: '$5',
  gap: '$5',
  maxWidth: 720,
  alignSelf: 'center',
  width: '100%',
  $sm: {
    p: '$3',
    gap: '$4',
  },
}))

export const ProductGrid = styled(YStack, s({
  p: '$5',
  gap: '$5',
  maxWidth: 1120,
  alignSelf: 'center',
  width: '100%',
  $sm: {
    p: '$3',
    gap: '$4',
  },
}))

export const Section = styled(YStack, s({
  gap: '$4',
}))

export const SectionHeading = styled(YStack, s({
  gap: '$2',
}))

export const Eyebrow = styled(Text, s({
  color: '$blue10',
  fontSize: '$2',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: 1.2,
}))

export const SectionTitle = styled(Text, s({
  color: '$color',
  fontSize: '$9',
  fontWeight: '800',
  letterSpacing: -0.8,
  $sm: {
    fontSize: '$7',
  },
}))

export const SectionDescription = styled(Text, s({
  color: '$placeholderColor',
  fontSize: '$4',
  lineHeight: '$4',
  maxWidth: 720,
  $sm: {
    fontSize: '$3',
  },
}))

export const SurfaceCard = styled(YStack, s({
  bg: '#ffffff',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$8',
  p: '$4',
  gap: '$3',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 4,
}))

export const CategoryBadge = styled(XStack, s({
  bg: '$blue2',
  px: '$2.5',
  py: '$1',
  borderRadius: '$10',
  borderWidth: 1,
  borderColor: '$blue4',
}))

export const AuthCenter = styled(YStack, s({
  flex: 1,
  ai: 'center',
  jc: 'center',
  p: '$5',
  width: '100%',
  $sm: {
    p: '$3',
  },
}))

export const AuthForm = styled(YStack, s({
  width: '100%',
  maxWidth: 440,
  gap: '$4',
}))

export const FormCard = styled(SurfaceCard, s({
  width: '100%',
  maxWidth: 440,
  p: '$5',
  gap: '$4',
  $sm: {
    p: '$4',
  },
}))

export const FormField = styled(YStack, s({
  gap: '$2',
}))

export const FormInput = styled(Input, s({
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

export const NavBar = styled(XStack, s({
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
  $sm: {
    minHeight: 64,
    px: '$3',
  },
}))

export const NavTitle = styled(Text, s({
  color: '$color',
  fontSize: '$6',
  fontWeight: '800',
  letterSpacing: -0.3,
  pressStyle: { opacity: 0.7 },
  $sm: {
    fontSize: '$5',
  },
}))

export const NavLink = styled(Text, s({
  color: '$placeholderColor',
  fontSize: '$4',
  fontWeight: '600',
  pressStyle: { opacity: 0.7 },
}))

export const HeroContainer = styled(YStack, s({
  bg: '#10233f',
  borderRadius: '$10',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  p: '$6',
  gap: '$5',
  minHeight: 320,
  jc: 'space-between',
  shadowColor: 'rgba(16, 35, 63, 0.28)',
  shadowOffset: { width: 0, height: 20 },
  shadowOpacity: 0.16,
  shadowRadius: 30,
  elevation: 8,
}))

export const HeroTitle = styled(Text, s({
  color: '#ffffff',
  fontSize: '$10',
  fontWeight: '900',
  lineHeight: '$10',
  letterSpacing: -1.4,
}))

export const HeroSubtitle = styled(Text, s({
  color: 'rgba(233, 241, 255, 0.84)',
  fontSize: '$5',
  lineHeight: '$5',
  maxWidth: 560,
}))

export const SectionHeader = styled(Text, s({
  fontSize: '$8',
  fontWeight: '800',
  color: '$color',
  mb: '$3',
}))

export const ProductCard = styled(YStack, s({
  bg: '#ffffff',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$8',
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 4,
  pressStyle: { scale: 0.98, opacity: 0.9 },
  width: '100%',
  $sm: { width: '48%' },
  $md: { width: '31.5%' },
  $lg: { width: '24%' },
}))

export const ProductVisual = styled(YStack, s({
  width: '100%',
  height: 168,
  ai: 'center',
  jc: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
}))

export const ProductInfo = styled(YStack, s({
  p: '$4',
  gap: '$3',
  $sm: {
    p: '$3',
    gap: '$2',
  },
}))

export const ProductTitle = styled(Text, s({
  color: '$color',
  fontSize: '$5',
  fontWeight: '700',
  lineHeight: '$5',
}))

export const ProductPrice = styled(Text, s({
  fontSize: '$7',
  fontWeight: '800',
  color: '$blue10',
}))

export const PrimaryButton = styled(Button, s({
  theme: 'brand',
  size: '$5',
  px: '$6',
  borderRadius: '$10',
  fontWeight: '700',
  shadowColor: 'rgba(31, 75, 143, 0.24)',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.18,
  shadowRadius: 24,
}))

export const AddToCartButton = styled(Button, s({
  theme: 'accent',
  px: '$4',
  py: '$2',
  fontSize: '$4',
  fontWeight: '600',
  borderRadius: '$8',
}))

export const SecondaryButton = styled(Button, s({
  bg: '#ffffff',
  color: '$color',
  borderWidth: 1,
  borderColor: '$borderColor',
  size: '$5',
  borderRadius: '$10',
  fontWeight: '700',
}))

export const GhostDangerButton = styled(Button, s({
  chromeless: true,
  color: '$red10',
  fontWeight: '700',
}))

export const MetricCard = styled(SurfaceCard, s({
  flex: 1,
  minWidth: 160,
  gap: '$2',
}))

export const MetricValue = styled(Text, s({
  color: '$color',
  fontSize: '$8',
  fontWeight: '800',
  letterSpacing: -0.8,
}))

export const MetricLabel = styled(Text, s({
  color: '$placeholderColor',
  fontSize: '$3',
  fontWeight: '600',
}))