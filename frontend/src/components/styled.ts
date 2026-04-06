import { styled, YStack, XStack, Text } from 'tamagui'

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
