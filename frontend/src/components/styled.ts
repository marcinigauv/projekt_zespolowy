import { styled, YStack, XStack, Text, Button, Image } from 'tamagui'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s = (v: any) => v

export const PageWrapper = styled(YStack, s({
  flex: 1,
  bg: '$background',
}))

export const PageContent = styled(YStack, s({
  p: '$5',
  gap: '$4',
  maxWidth: 720,
  alignSelf: 'center',
  width: '100%',
}))

export const ProductGrid = styled(YStack, s({
  p: '$4',
  gap: '$4',
  maxWidth: 960,
  alignSelf: 'center',
  width: '100%',
}))

export const CategoryBadge = styled(XStack, s({
  bg: '$blue2',
  px: '$2',
  py: '$0.5',
  borderRadius: '$10',
}))

export const AuthCenter = styled(YStack, s({
  flex: 1,
  ai: 'center',
  jc: 'center',
  p: '$4',
}))

export const AuthForm = styled(YStack, s({
  width: '100%',
  maxWidth: 420,
  gap: '$4',
}))

export const NavBar = styled(XStack, s({
  bg: '$blue9',
  height: 56,
  ai: 'center',
  jc: 'space-between',
  px: '$4',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
}))

export const NavTitle = styled(Text, s({
  color: 'white',
  fontSize: '$6',
  fontWeight: 'bold',
  pressStyle: { opacity: 0.7 },
}))

export const NavLink = styled(Text, s({
  color: 'white',
  fontSize: '$4',
  pressStyle: { opacity: 0.7 },
}))

export const HeroContainer = styled(YStack, s({
  height: 320,
  bg: '$blue10',
  ai: 'center',
  jc: 'center',
  p: '$6',
  gap: '$5',
}))

export const HeroTitle = styled(Text, s({
  color: 'white',
  fontSize: '$10',
  fontWeight: '900',
  textAlign: 'center',
  lineHeight: 52,
}))

export const HeroSubtitle = styled(Text, s({
  color: '$blue1',
  fontSize: '$6',
  textAlign: 'center',
  maxWidth: 600,
}))

export const SectionHeader = styled(Text, s({
  fontSize: '$8',
  fontWeight: '800',
  color: '$color',
  mb: '$3',
}))

export const ProductCard = styled(YStack, s({
  bg: '$background',
  borderRadius: '$8',
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 8,
  pressStyle: { scale: 0.98, opacity: 0.9 },
  width: '100%',
  $sm: { width: '48%' },
  $md: { width: '31%' },
  $lg: { width: '23%' },
}))

export const ProductImage = styled(Image, s({
  width: '100%',
  height: 200,
}))

export const ProductInfo = styled(YStack, s({
  p: '$4',
  gap: '$3',
}))

export const ProductTitle = styled(Text, s({
  fontSize: '$6',
  fontWeight: '700',
}))

export const ProductPrice = styled(Text, s({
  fontSize: '$7',
  fontWeight: 'bold',
  color: '$green9',
}))

export const PrimaryButton = styled(Button, s({
  bg: '$blue9',
  color: 'white',
  px: '$6',
  py: '$3',
  fontSize: '$5',
  fontWeight: '700',
  borderRadius: '$12',
}))

export const AddToCartButton = styled(Button, s({
  bg: '$green9',
  color: 'white',
  px: '$4',
  py: '$2',
  fontSize: '$4',
  fontWeight: '600',
  borderRadius: '$8',
}))