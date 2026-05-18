import { styled, YStack, XStack, Text, Button, Input, ScrollView } from 'tamagui'

const styles = <Value,>(value: Value) => value

export const PageWrapper = styled(YStack, styles({
  flex: 1,
  bg: '#ebf9f4',
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
  color: '#325649',
  fontSize: '$10',
  fontWeight: '100',
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
  theme: 'surface',
  bg: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$2',
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
  background:'#e6f4ff',
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
  bottom: '0',
  /* top: 88, */
  right:'0'  /*  '$4' */,
  left: '0'  /* '$4' */,
  gap: '$2.5',
  alignItems: 'stretch' /*  'flex-end' */,
  pointerEvents: 'box-none',
  zIndex: 30,
}))

export const ToastCardButton = styled(Button, styles({
  width: '100%',
  /* maxWidth: 360, */
  bg: 'rgba(212, 8, 8, 0.65)',
  borderWidth: 1,
  borderColor: '#c9d9ea',
  borderRadius: '0',
  px: '$3.5',
  py: '$3',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  shadowColor: 'rgba(58, 90, 122, 0.22)',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 20,
  elevation: 3,
  hoverStyle: {
    bg: '#FFD700',         
    borderColor: '#FFC800', 
  },
}))

export const ToastCardWrap = styled(YStack, styles({
  width: '100%',
  /* maxWidth: 360, */
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
  right: 250,
  bottom: '100%',
  mt: '$2',
  maxWidth: 420,
  bg: '#17324b',
  borderRadius: '$6',
  px: '$4',
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
  $xs: {
    fontSize: '$2',
    lineHeight: '$3',
  },
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
  borderRadius: '$2',
  borderWidth: 1,
  borderColor: '$blue4',
  marginTop: '$2',
  marginBottom: '$4',
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
  background:'#e6f4ff',
  maxWidth: 440,
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 18,
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
  bg: '#c6e1f7',
  borderColor: '$borderColor',
  color: '#325649',
  borderRadius: '$2',
  px: '$3',
  focusStyle: {
    borderColor: '$outlineColor',
    bg: '#c6e1f7',
  },
}))

export const SearchInput = styled(FormInput, styles({
  width: '100%',
  bg: '#c6e1f7',
}))

export const NavBar = styled(XStack, styles({
  theme: 'surface',
  bg:'#5d6d7b',
  minHeight: 72,
  minWidth: 0,
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
   color: '#effff9',
  fontSize: '$6',
  fontWeight: '800',
  letterSpacing: -0.3,
  cursor: 'pointer',
  hoverStyle: {
   color: '#bef7e2',
  },
  pressStyle: { opacity: 0.7 },
  $md: {
    fontSize: '$5',
  },
  $sm: {
    fontSize: '$5',
  },
  $xxs: {
    fontSize: '$4',
  },
}))

export const NavLink = styled(Text, styles({
  color: '$placeholderColor',
  fontSize: '$4',
  fontWeight: '600',
  cursor: 'pointer',
  hoverStyle: {
    color: '$color',
  },
  pressStyle: { opacity: 0.7 },
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
  width: 46,
  height: 46,
  bg:'#bef7e2',
  borderRadius: '$15',
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
  color: '#effff9',
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
  flexShrink: 0,
  $md: {
    gap: '$3',
  },
  $sm: {
    gap: '$2',
  },
  $xxs: {
    gap: '$1.5',
  },
}))

export const HeaderIconButton = styled(YStack, styles({
  theme: 'surface',
  width: 42,
  height: 42,
  borderRadius: '$7',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '#bef7e2',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
}))

export const HeaderPrimaryIconButton = styled(YStack, styles({
  width: 42,
  height: 42,
  borderRadius: '$7',
  bg: '#bef7e2',
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
  $xxs: {
    top: -4,
    right: -2,
    minWidth: 18,
    px: '$1',
  },
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
  borderRadius: '$2',
  bg: '#bef7e2'
  
}))

export const HeaderMenuButton = styled(Button, styles({
  chromeless: true,
  width: '100%',
  size: '$5',
  justifyContent: 'flex-start',
  cursor: 'pointer',
  px: '$4',
  py: '$3',
  color: '#325649',
  bg: '#bef7e2',
   hoverStyle: {
    width: '100%',
    bg: '#ecf6f3',          
  }, 
  
}))

export const HeaderProfileSurface = styled(YStack, styles({
  theme: 'surface',
  bg: '#bef7e2'
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
  bg: '#325649',
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
  theme: 'surface',
  /* background:'#c6e1f7', */
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$2',
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
  cursor: 'pointer',
  hoverStyle: { opacity: 0.96 },
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
 /*  p: '$3', */
/*   gap: '$1.5', */
  /* borderBottomWidth: 1, */
   background:'#ecf7ff !important',
 /*  borderBottomColor: '$borderColor', */
  $sm: {
    p: '$2.5',
  },
}))

export const ProductCardFooter = styled(YStack, styles({
  p: '$3',
  theme: 'surface',
  background:'#ecf7ff',
}))

export const ProductTitle = styled(Text, styles({
  color: '#325649',
  fontSize: '$7',
  textAlign: 'left',
  fontWeight: '100',
  lineHeight: '$7',
  marginBottom: '$3',
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
  /* widthMax: 'content', */
  /* justifyContent:"flex-end", */
  fontWeight: '800',
  color:'#04946e' , 
  padding: '$2',
  borderRadius: '$2',
  $sm: {
    fontSize: '$5',
  },
}))

export const ProductMetaRow = styled(XStack, styles({
  gap: '$2',
  justifyContent: 'flex-start',
  /* alignItems: 'center', */
   background:'#ecf7ff',
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
  theme: 'surface',
  flex: 1,
  minWidth: 280,
  borderRadius: '$8',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '$background',
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

export const ProductCarouselMedia = styled(ProductVisual, styles({}))

export const ProductImagePlaceholder = styled(YStack, styles({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  theme: 'surface',
  bg: '#bef7e2',   
}))

export const ProductCarouselFrame = styled(YStack, styles({
  theme: 'surface',
  borderRadius: '$8',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',
 bg:'#c6e1f7',
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
   /*  marginTop: '$8', */
  }), 
  
  // 👇 DRUGI ARGUMENT: przekazujemy $xs bezpośrednio do Tamagui, POMIJAJĄC funkcję styles()
  /* {
    $xs: {
      marginTop: 0,
    },
  } */
)

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
  color: '#325649',
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
  fontWeight: '700',
  shadowColor: 'rgba(31, 75, 143, 0.18)',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  background: '#62eebb',
  color: '#325649',
  borderRadius: '$2',
  borderColor:'#05ea96f5',
  hoverStyle: {
    bg: '#e0fff4',          
  },
  $xs: {
    width: '100%',
  },
}))

export const AddToCartButton = styled(Button, styles({
  theme: 'accent',
  px: '$4',
  py: '$2',
  fontSize: '$4',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 18,
  fontWeight: '600',
  background: '#62eebb',
  color: '#325649',
  borderRadius: '$2',
  borderColor:'#05ea96f5',
  hoverStyle: {
    bg: '#e0fff4',          
  },
  $xs: {
    width: '100%',
  },
}))

export const ProductCardAddButton = styled(AddToCartButton, styles({
  width: '100%',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 18,
}))

export const SecondaryButton = styled(Button, styles({
  theme: 'surface',   
  borderWidth: 1,  
  size: '$5',  
  fontWeight: '700',
  background: 'rgb(76, 194, 221)',
  color: '#325649',
  borderRadius: '$2',
  borderColor:'#71e4fbf5',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 18,
  hoverStyle: {
  bg: '#c6e1f7',          
  },
  
}))

export const GhostDangerButton = styled(Button, styles({
  chromeless: true,
  color: '$red10',
  fontWeight: '700',
  borderRadius: '$2',
}))