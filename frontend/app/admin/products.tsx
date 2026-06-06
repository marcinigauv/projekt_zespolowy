import React, { useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Modal, Platform, useWindowDimensions } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Label, ScrollView, Text, XStack, YStack, H1, Paragraph, getVariableValue, useTheme } from 'tamagui'
import { useRouteAccess } from '../../src/auth/useRouteAccess'
import { Header } from '../../src/components/Header'
import {
  createProductUseCase,
  deleteProductUseCase,
  searchAdminProductsUseCase,
  type Product,
  updateProductUseCase,
} from '../../src/products/useCases'
import {
  ActionButtonRow,
  AdminFeedbackText,
  AdminHelperText,
  AdminResultCard,
  AdminResultMeta,
  AdminResultsList,
  AdminResultSummary,
  AdminResultTitle,
  AdminResultValue,
  AdminResultValueRight,
  AdminSectionCard,
  AdminSectionHeader,
  AdminSectionTitle,
  CardHeaderStrip,
  DataRow,
  EmptyStateCard,
  Eyebrow,
  FormField,
  FormInput,
  GhostDangerButton,
  InfoTile,
  InfoTileLabel,
  InfoTileMeta,
  InfoTileValue,
  MetricTile,
  ModalBackdrop,
  ModalBodyScroll,
  ModalCard,
  ModalHeaderRow,
  PageContent,
  PageWrapper,
  PrimaryButton,
  ProductPrice,
  SearchInput,
  SearchRow,
  SecondaryButton,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  WideFormCard,
} from '../../src/components/styled'

interface ProductFormState {
  name: string
  description: string
  price: string
  amount: string
  categories: string
  imageUrl: string
}

const emptyFormState: ProductFormState = {
  name: '',
  description: '',
  price: '',
  amount: '',
  categories: '',
  imageUrl: '',
}

const emptySearchMessage = 'Wpisz ID produktu lub kilka fraz, aby rozpocząć wyszukiwanie.'

type ProductModalMode = 'create' | 'edit'

function toFormState(product: Product): ProductFormState {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    amount: String(product.amount),
    categories: product.categories.join(', '),
    imageUrl: product.imageUrl ?? '',
  }
}

function parseCategories(value: string): string[] {
  return value
    .split(',')
    .map((category) => category.trim())
    .filter((category) => category.length > 0)
}

export default function AdminProductsScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { width: viewportWidth } = useWindowDimensions()
  const { canRender } = useRouteAccess({ requireAdmin: true })
  const primaryColor = getVariableValue(theme.stitchPrimary)
  const surfaceColor = getVariableValue(theme.backgroundHover)
  const borderColor = getVariableValue(theme.stitchBorder)
  const baseSurfaceColor = getVariableValue(theme.background)
  const nameInputRef = useRef<React.ElementRef<typeof FormInput>>(null)
  const descriptionInputRef = useRef<React.ElementRef<typeof FormInput>>(null)
  const priceInputRef = useRef<React.ElementRef<typeof FormInput>>(null)
  const amountInputRef = useRef<React.ElementRef<typeof FormInput>>(null)
  const categoriesInputRef = useRef<React.ElementRef<typeof FormInput>>(null)
  const imageUrlInputRef = useRef<React.ElementRef<typeof FormInput>>(null)
  const [createForm, setCreateForm] = useState<ProductFormState>(emptyFormState)
  const [editForm, setEditForm] = useState<ProductFormState>(emptyFormState)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchMessage, setSearchMessage] = useState(emptySearchMessage)
  const [createError, setCreateError] = useState('')
  const [createSuccessMessage, setCreateSuccessMessage] = useState('')
  const [editError, setEditError] = useState('')
  const [editSuccessMessage, setEditSuccessMessage] = useState('')
  const [modalMode, setModalMode] = useState<ProductModalMode | null>(null)

  const handleFormChange = (
    mode: 'create' | 'edit',
    field: keyof ProductFormState,
    value: string,
  ) => {
    const update = (current: ProductFormState) => ({
      ...current,
      [field]: value,
    })

    if (mode === 'create') {
      setCreateForm(update)
      return
    }

    setEditForm(update)
  }

  const handleCreateReset = () => {
    setCreateForm(emptyFormState)
    setCreateError('')
    setCreateSuccessMessage('')
    nameInputRef.current?.focus()
  }

  const closeModal = () => {
    setModalMode(null)
  }

  const openCreateModal = () => {
    setCreateError('')
    setCreateSuccessMessage('')
    setModalMode('create')
  }

  const handleClearSelection = () => {
    setSelectedProduct(null)
    setEditForm(emptyFormState)
    setEditError('')
    setEditSuccessMessage('')
  }

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditForm(toFormState(product))
    setEditError('')
    setEditSuccessMessage('')
    setModalMode('edit')
  }

  const handleSearch = async () => {
    const query = searchQuery.trim()

    if (!query) {
      setSearchResults([])
      setSearchError('')
      setSearchMessage(emptySearchMessage)
      handleClearSelection()
      return
    }

    try {
      setIsSearching(true)
      setSearchError('')
      setSearchMessage('')
      setEditError('')
      setEditSuccessMessage('')

      const results = await searchAdminProductsUseCase({ query })
      const nextSelectedProduct = selectedProduct
        ? results.find((product) => product.id === selectedProduct.id) ?? null
        : null

      setSearchResults(results)
      setSelectedProduct(nextSelectedProduct)

      if (nextSelectedProduct) {
        setEditForm(toFormState(nextSelectedProduct))
      } else {
        setEditForm(emptyFormState)
      }

      if (results.length === 0) {
        setSearchMessage('Brak wyników dla podanego wyszukiwania.')
        return
      }

      setSearchMessage(`Znaleziono wyników: ${results.length}`)
    } catch (caughtError) {
      setSearchResults([])
      setSearchError(caughtError instanceof Error ? caughtError.message : 'Nie udało się wyszukać produktów')
      handleClearSelection()
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      setCreateError('')
      setCreateSuccessMessage('')
      setIsSubmitting(true)

      const createdProduct = await createProductUseCase({
        name: createForm.name,
        description: createForm.description,
        price: Number(createForm.price),
        amount: Number(createForm.amount),
        categories: parseCategories(createForm.categories),
        imageUrl: createForm.imageUrl,
      })

      setCreateForm(emptyFormState)
      setCreateSuccessMessage(`Produkt został dodany: ${createdProduct.name}`)
    } catch (caughtError) {
      setCreateError(caughtError instanceof Error ? caughtError.message : 'Nie udało się dodać produktu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!selectedProduct) {
      return
    }

    try {
      setEditError('')
      setEditSuccessMessage('')
      setIsSubmitting(true)

      const updatedProduct = await updateProductUseCase({
        id: selectedProduct.id,
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price),
        amount: Number(editForm.amount),
        categories: parseCategories(editForm.categories),
        imageUrl: editForm.imageUrl,
      })

      setSearchResults((current) => current.map((product) => (
        product.id === updatedProduct.id ? updatedProduct : product
      )))
      setSelectedProduct(updatedProduct)
      setEditForm(toFormState(updatedProduct))
      setEditSuccessMessage('Produkt został zaktualizowany')
    } catch (caughtError) {
      setEditError(caughtError instanceof Error ? caughtError.message : 'Nie udało się zapisać produktu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) {
      return
    }

    try {
      setEditError('')
      setEditSuccessMessage('')
      setIsDeleting(true)
      await deleteProductUseCase({ id: selectedProduct.id })
      setSearchResults((current) => current.filter((product) => product.id !== selectedProduct.id))
      setSearchMessage('Produkt został usunięty z wyników wyszukiwania.')
      handleClearSelection()
      closeModal()
    } catch (caughtError) {
      setEditError(caughtError instanceof Error ? caughtError.message : 'Nie udało się usunąć produktu')
    } finally {
      setIsDeleting(false)
    }
  }

  const selectedProductCategories = selectedProduct?.categories.join(', ') ?? ''
  const isModalOpen = modalMode !== null
  const isEditMode = modalMode === 'edit'
  const modalTitle = isEditMode ? 'Edytuj produkt' : 'Dodaj nowy produkt'
  const modalDescription = isEditMode
    ? selectedProduct
      ? `Wybrany produkt: #${selectedProduct.id} • ${selectedProduct.name}`
      : 'Najpierw wyszukaj i wybierz produkt z listy wyników.'
    : 'Uzupełnij dane nowego produktu i zatwierdź formularz.'
  const activeForm = isEditMode ? editForm : createForm
  const activeError = isEditMode ? editError : createError
  const activeSuccessMessage = isEditMode ? editSuccessMessage : createSuccessMessage
  const canRenderEditForm = !isEditMode || selectedProduct !== null
  const modalPrimaryActionLabel = isEditMode ? 'Zapisz zmiany' : 'Dodaj produkt'
  const modalSecondaryActionLabel = isEditMode ? 'Przywróć dane' : 'Wyczyść formularz'
  const isFormDisabled = isSubmitting || isDeleting
  const selectedProductSummary = useMemo(() => {
    if (!selectedProduct) {
      return 'Wybierz produkt z listy wyników, aby otworzyć formularz edycji.'
    }

    return `Wybrany produkt: #${selectedProduct.id} • ${selectedProduct.name}`
  }, [selectedProduct])
  const isPhone = Platform.OS === 'web' ? viewportWidth <= 520 : viewportWidth <= 760
  const nativeScrollBottomPadding = Platform.OS === 'web' ? 0 : 176

  if (!canRender) {
    return null
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent style={{ maxWidth: 1180, paddingBottom: nativeScrollBottomPadding }}>
          <SectionHeading style={{ maxWidth: 760 }}>
            <Eyebrow>Panel Admina</Eyebrow>
            <SectionTitle>Zarządzanie Przedmiotami</SectionTitle>
            <SectionDescription>
              Dodawaj nowe produkty bezpośrednio do bazy danych sklepu.
            </SectionDescription>
            <ActionButtonRow>
              <PrimaryButton
                onPress={openCreateModal}
                style={{ minHeight: 56, minWidth: isPhone ? undefined : 240, width: isPhone ? '96%' : undefined, alignSelf: isPhone ? 'center' : undefined }}
              >
                Dodaj nowy produkt
              </PrimaryButton>
            </ActionButtonRow>
          </SectionHeading>

          <AdminSectionCard style={{ padding: 0, overflow: 'hidden' }}>
            <CardHeaderStrip>
              <AdminSectionTitle>Znajdź produkt do edycji</AdminSectionTitle>
              <AdminHelperText>
                Wpisz ID produktu lub kilka fraz (np. Lego, komputer)
              </AdminHelperText>
            </CardHeaderStrip>

            <YStack p="$3.5" gap="$3.5">
              <YStack
                gap="$4"
                style={{
                  width: '100%',
                  display: isPhone ? 'flex' : 'none',
                  alignItems: 'center',
                  minHeight: 248,
                  paddingBottom: 24,
                }}
              >
                <SearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Np. 15 laptop promocja"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  style={{ minHeight: 56, width: '100%' }}
                  onSubmitEditing={() => { void handleSearch() }}
                />
                <PrimaryButton
                  disabled={isSearching}
                  onPress={() => { void handleSearch() }}
                  style={{ minHeight: 56, width: '92%', alignSelf: 'center', marginTop: 12 }}
                >
                  Szukaj
                </PrimaryButton>
                <SecondaryButton
                  disabled={isSearching}
                  onPress={() => {
                    setSearchQuery('')
                    setSearchResults([])
                    setSearchError('')
                    setSearchMessage(emptySearchMessage)
                    handleClearSelection()
                  }}
                  style={{ minHeight: 56, width: '92%', alignSelf: 'center' }}
                >
                  Wyczyść
                </SecondaryButton>
              </YStack>

              <SearchRow style={{ display: isPhone ? 'none' : 'flex', alignItems: 'stretch' }}>
                <SearchInput
                  flex={1}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Np. 15 laptop promocja"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  style={{ minHeight: 56, width: '100%' }}
                  onSubmitEditing={() => { void handleSearch() }}
                />
                <PrimaryButton
                  disabled={isSearching}
                  onPress={() => { void handleSearch() }}
                  style={{ minHeight: 56 }}
                >
                  Szukaj
                </PrimaryButton>
                {searchQuery.length > 0 ? (
                  <SecondaryButton
                    disabled={isSearching}
                    onPress={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setSearchError('')
                      setSearchMessage(emptySearchMessage)
                      handleClearSelection()
                    }}
                    style={{ minHeight: 56 }}
                  >
                    Wyczyść
                  </SecondaryButton>
                ) : null}
              </SearchRow>

              <YStack
                style={{
                  borderWidth: 1,
                  borderColor: searchError ? '#f2b8b5' : borderColor,
                  borderRadius: 18,
                  backgroundColor: searchError ? '#ffdad6' : surfaceColor,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                {searchError ? <AdminFeedbackText tone="danger">{searchError}</AdminFeedbackText> : null}
                {!searchError ? <AdminFeedbackText tone="neutral">{isSearching ? 'Trwa wyszukiwanie...' : searchMessage}</AdminFeedbackText> : null}
              </YStack>

              {searchResults.length > 0 ? (
                <AdminResultsList>
                  {searchResults.map((product) => (
                    <AdminResultCard key={product.id} style={{ padding: 0, overflow: 'hidden' }}>
                      <YStack>
                        <XStack
                          gap="$3"
                          px="$4"
                          py="$4"
                          flexDirection={isPhone ? 'column' : 'row'}
                          style={{
                            justifyContent: 'space-between',
                            alignItems: isPhone ? 'flex-start' : 'center',
                          }}
                        >
                          <AdminResultSummary style={{ minWidth: 0, flex: 1 }}>
                            <AdminResultTitle>{product.name}</AdminResultTitle>
                            <AdminResultMeta numberOfLines={2}>{product.description}</AdminResultMeta>
                          </AdminResultSummary>

                          <MetricTile
                            style={{
                              alignItems: isPhone ? 'flex-start' : 'flex-end',
                              minWidth: isPhone ? 0 : 170,
                              width: isPhone ? '100%' : undefined,
                              paddingVertical: 12,
                            }}
                          >
                            <ProductPrice style={{ color: primaryColor }}>{product.price.toFixed(2)} zł</ProductPrice>
                          </MetricTile>
                        </XStack>

                        <XStack gap="$3" flexWrap="wrap" px="$4" pb="$4">
                          <InfoTile flexBasis={120}>
                            <InfoTileLabel>
                              ID
                            </InfoTileLabel>
                            <InfoTileValue>{product.id}</InfoTileValue>
                          </InfoTile>

                          <InfoTile flexBasis={160}>
                            <InfoTileLabel>
                              Stan magazynowy
                            </InfoTileLabel>
                            <InfoTileValue>{product.amount}</InfoTileValue>
                          </InfoTile>

                          <InfoTile flexBasis={260}>
                            <InfoTileLabel>
                              Kategorie
                            </InfoTileLabel>
                            <InfoTileValue style={{ fontSize: 18, lineHeight: 24 }}>{product.categories.join(', ')}</InfoTileValue>
                          </InfoTile>
                        </XStack>

                        <YStack
                          style={{
                            alignItems: isPhone ? 'stretch' : 'center',
                            borderTopWidth: 1,
                            borderTopColor: borderColor,
                            paddingHorizontal: 16,
                            paddingTop: 14,
                            paddingBottom: 16,
                          }}
                        >
                          <SecondaryButton
                            onPress={() => handleSelectProduct(product)}
                            style={{ minHeight: 56, minWidth: isPhone ? undefined : 220, width: isPhone ? '100%' : undefined }}
                          >
                            Edytuj
                          </SecondaryButton>
                        </YStack>
                      </YStack>
                    </AdminResultCard>
                  ))}
                </AdminResultsList>
              ) : null}
            </YStack>
          </AdminSectionCard>

          <AdminSectionCard style={{ padding: 0, overflow: 'hidden' }}>
            <CardHeaderStrip>
              <AdminSectionTitle>Wybrany produkt</AdminSectionTitle>
              <AdminHelperText>{selectedProductSummary}</AdminHelperText>
            </CardHeaderStrip>

            {selectedProduct ? (
              <WideFormCard style={{ padding: 0, overflow: 'hidden' }}>
                <YStack p="$3.5" gap="$3.5">
                  <XStack gap="$3" flexWrap="wrap" p="$3.5">
                    <InfoTile flexBasis={240}>
                      <InfoTileLabel>
                        Nazwa
                      </InfoTileLabel>
                      <InfoTileValue>{selectedProduct.name}</InfoTileValue>
                    </InfoTile>

                    <InfoTile flexBasis={180}>
                      <InfoTileLabel>
                        ID
                      </InfoTileLabel>
                      <InfoTileValue>{selectedProduct.id}</InfoTileValue>
                    </InfoTile>

                    <InfoTile flexBasis={200}>
                      <InfoTileLabel>
                        Stan magazynowy
                      </InfoTileLabel>
                      <InfoTileValue>{selectedProduct.amount}</InfoTileValue>
                    </InfoTile>

                    <InfoTile flexBasis={300}>
                      <InfoTileLabel>
                        Kategorie
                      </InfoTileLabel>
                      <InfoTileValue style={{ fontSize: 18, lineHeight: 24 }}>{selectedProductCategories}</InfoTileValue>
                    </InfoTile>
                  </XStack>

                  <YStack
                    style={{
                      alignItems: isPhone ? 'stretch' : 'center',
                      borderTopWidth: 1,
                      borderTopColor: borderColor,
                      paddingTop: 14,
                    }}
                  >
                    <ActionButtonRow style={{ justifyContent: isPhone ? 'stretch' : 'center', width: '100%' }}>
                      <PrimaryButton
                        onPress={() => setModalMode('edit')}
                        style={{ minHeight: 56, minWidth: isPhone ? undefined : 220, width: isPhone ? '100%' : undefined }}
                      >
                        Otwórz edycję
                      </PrimaryButton>
                      <SecondaryButton
                        onPress={handleClearSelection}
                        style={{ minHeight: 56, minWidth: isPhone ? undefined : 220, width: isPhone ? '100%' : undefined }}
                      >
                        Wyczyść wybór
                      </SecondaryButton>
                    </ActionButtonRow>
                  </YStack>
                </YStack>
              </WideFormCard>
            ) : (
              <EmptyStateCard
                gap="$3"
                style={{
                  margin: 16,
                  borderWidth: 1,
                  borderColor,
                  borderRadius: 22,
                  backgroundColor: surfaceColor,
                  paddingHorizontal: 24,
                  paddingVertical: 40,
                }}
              >
                <YStack
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor,
                    backgroundColor: baseSurfaceColor,
                  }}
                >
                  <MaterialIcons name="search" size={30} color={primaryColor} />
                </YStack>
                <AdminHelperText>Brak wybranego produktu do edycji.</AdminHelperText>
              </EmptyStateCard>
            )}
          </AdminSectionCard>
        </PageContent>
      </ScrollView>

      <Modal transparent visible={isModalOpen} animationType="fade" onRequestClose={closeModal}>
        <ModalBackdrop>
          <ModalCard style={{ width: '100%', maxWidth: 860 }}>
            {isPhone ? (
              <YStack gap="$3.5">
                <AdminSectionHeader>
                  <H1 size="$7" fontWeight="700">{modalTitle}</H1>
                  <Paragraph size="$4" color="$gray11">{modalDescription}</Paragraph>
                </AdminSectionHeader>
                <SecondaryButton onPress={closeModal} style={{ minHeight: 56, width: '100%' }}>
                  Zamknij
                </SecondaryButton>
              </YStack>
            ) : (
              <ModalHeaderRow style={{ gap: 16 }}>
                <AdminSectionHeader flex={1}>
                  <H1 size="$8" fontWeight="700">{modalTitle}</H1>
                  <Paragraph size="$4" color="$gray11">{modalDescription}</Paragraph>
                </AdminSectionHeader>
                <SecondaryButton onPress={closeModal} style={{ minHeight: 56 }}>
                  Zamknij
                </SecondaryButton>
              </ModalHeaderRow>
            )}

            <ModalBodyScroll showsVerticalScrollIndicator={false}>
              {canRenderEditForm ? (
                <YStack gap="$4" pb="$1">
                  <FormField>
                    <Label htmlFor={isEditMode ? 'edit-product-name' : 'create-product-name'}>Nazwa</Label>
                    <FormInput
                      ref={nameInputRef}
                      id={isEditMode ? 'edit-product-name' : 'create-product-name'}
                      value={activeForm.name}
                      onChangeText={(value) => handleFormChange(isEditMode ? 'edit' : 'create', 'name', value)}
                      returnKeyType="next"
                      disabled={isFormDisabled}
                      onSubmitEditing={() => descriptionInputRef.current?.focus()}
                    />
                  </FormField>

                  <FormField>
                    <Label htmlFor={isEditMode ? 'edit-product-description' : 'create-product-description'}>Opis</Label>
                    <FormInput
                      ref={descriptionInputRef}
                      id={isEditMode ? 'edit-product-description' : 'create-product-description'}
                      value={activeForm.description}
                      onChangeText={(value) => handleFormChange(isEditMode ? 'edit' : 'create', 'description', value)}
                      multiline
                      blurOnSubmit
                      returnKeyType="next"
                      disabled={isFormDisabled}
                      onSubmitEditing={() => priceInputRef.current?.focus()}
                    />
                  </FormField>

                  <FormField>
                    <Label htmlFor={isEditMode ? 'edit-product-price' : 'create-product-price'}>Cena</Label>
                    <FormInput
                      ref={priceInputRef}
                      id={isEditMode ? 'edit-product-price' : 'create-product-price'}
                      value={activeForm.price}
                      onChangeText={(value) => handleFormChange(isEditMode ? 'edit' : 'create', 'price', value)}
                      keyboardType="decimal-pad"
                      returnKeyType="next"
                      disabled={isFormDisabled}
                      onSubmitEditing={() => amountInputRef.current?.focus()}
                    />
                  </FormField>

                  <FormField>
                    <Label htmlFor={isEditMode ? 'edit-product-amount' : 'create-product-amount'}>Stan magazynowy</Label>
                    <FormInput
                      ref={amountInputRef}
                      id={isEditMode ? 'edit-product-amount' : 'create-product-amount'}
                      value={activeForm.amount}
                      onChangeText={(value) => handleFormChange(isEditMode ? 'edit' : 'create', 'amount', value)}
                      keyboardType="number-pad"
                      returnKeyType="next"
                      disabled={isFormDisabled}
                      onSubmitEditing={() => categoriesInputRef.current?.focus()}
                    />
                  </FormField>

                  <FormField>
                    <Label htmlFor={isEditMode ? 'edit-product-categories' : 'create-product-categories'}>Kategorie</Label>
                    <FormInput
                      ref={categoriesInputRef}
                      id={isEditMode ? 'edit-product-categories' : 'create-product-categories'}
                      value={activeForm.categories}
                      onChangeText={(value) => handleFormChange(isEditMode ? 'edit' : 'create', 'categories', value)}
                      returnKeyType="next"
                      disabled={isFormDisabled}
                      onSubmitEditing={() => imageUrlInputRef.current?.focus()}
                    />
                  </FormField>

                  <FormField>
                    <Label htmlFor={isEditMode ? 'edit-product-image-url' : 'create-product-image-url'}>URL obrazu</Label>
                    <FormInput
                      ref={imageUrlInputRef}
                      id={isEditMode ? 'edit-product-image-url' : 'create-product-image-url'}
                      value={activeForm.imageUrl}
                      onChangeText={(value) => handleFormChange(isEditMode ? 'edit' : 'create', 'imageUrl', value)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      returnKeyType="done"
                      disabled={isFormDisabled}
                      onSubmitEditing={() => {
                        if (isEditMode) {
                          void handleUpdateProduct()
                          return
                        }
                        void handleCreateProduct()
                      }}
                    />
                  </FormField>

                  {activeError ? <AdminFeedbackText tone="danger">{activeError}</AdminFeedbackText> : null}
                  {activeSuccessMessage ? <AdminFeedbackText tone="success">{activeSuccessMessage}</AdminFeedbackText> : null}

                  <ActionButtonRow style={{ justifyContent: isPhone ? 'stretch' : 'flex-start' }}>
                    <PrimaryButton
                      disabled={isSubmitting || isDeleting}
                      style={{ minHeight: 56, width: isPhone ? '100%' : undefined }}
                      onPress={() => {
                        if (isEditMode) {
                          void handleUpdateProduct()
                          return
                        }
                        void handleCreateProduct()
                      }}
                    >
                      {modalPrimaryActionLabel}
                    </PrimaryButton>
                    <SecondaryButton
                      disabled={isSubmitting || isDeleting}
                      style={{ minHeight: 56, width: isPhone ? '100%' : undefined }}
                      onPress={() => {
                        if (isEditMode) {
                          if (selectedProduct) {
                            setEditForm(toFormState(selectedProduct))
                          }
                          setEditError('')
                          setEditSuccessMessage('')
                          return
                        }
                        handleCreateReset()
                      }}
                    >
                      {modalSecondaryActionLabel}
                    </SecondaryButton>
                    {isEditMode ? (
                      <SecondaryButton
                        disabled={isSubmitting || isDeleting}
                        onPress={handleClearSelection}
                        style={{ minHeight: 56, width: isPhone ? '100%' : undefined }}
                      >
                        Wyczyść wybór
                      </SecondaryButton>
                    ) : null}
                    {isEditMode ? (
                      <GhostDangerButton
                        disabled={isSubmitting || isDeleting}
                        onPress={() => { void handleDelete() }}
                        style={{ minHeight: 56, width: isPhone ? '100%' : undefined }}
                      >
                        Usuń produkt
                      </GhostDangerButton>
                    ) : null}
                  </ActionButtonRow>
                </YStack>
              ) : (
                <EmptyStateCard gap="$3">
                  <YStack
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 999,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor,
                      backgroundColor: baseSurfaceColor,
                    }}
                  >
                    <MaterialIcons name="search" size={30} color={primaryColor} />
                  </YStack>
                  <AdminHelperText>Najpierw wybierz produkt do edycji.</AdminHelperText>
                </EmptyStateCard>
              )}
            </ModalBodyScroll>
          </ModalCard>
        </ModalBackdrop>
      </Modal>
    </PageWrapper>
  )
}