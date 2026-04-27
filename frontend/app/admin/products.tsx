import React, { useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Modal } from 'react-native'
import { Label, ScrollView, Text, YStack } from 'tamagui'
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
  DataRow,
  EmptyStateCard,
  Eyebrow,
  FormCard,
  FormField,
  FormInput,
  GhostDangerButton,
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
  const { canRender } = useRouteAccess({ requireAdmin: true })
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

  if (!canRender) {
    return null
  }

  return (
    <PageWrapper>
      <Header />
      <ScrollView>
        <PageContent>
          <SectionHeading>
            <Eyebrow>Panel Admina</Eyebrow>
            <SectionTitle>Zarządzanie Przedmiotami</SectionTitle>
            <SectionDescription>
              Dodawaj nowe produkty oraz przechodź przez etapy wyszukania, wyboru i edycji konkretnej pozycji.
            </SectionDescription>
            <ActionButtonRow>
              <PrimaryButton onPress={openCreateModal}>
                Dodaj nowy produkt
              </PrimaryButton>
            </ActionButtonRow>
          </SectionHeading>

          <AdminSectionCard>
            <AdminSectionHeader>
              <AdminSectionTitle>Znajdź produkt do edycji</AdminSectionTitle>
              <AdminHelperText>
                Wpisz ID produktu albo kilka tokenów tekstowych. Liczby traktujemy jako ID, tekst wyszukujemy po nazwie i opisie.
              </AdminHelperText>
            </AdminSectionHeader>

            <SearchRow>
              <SearchInput
                flex={1}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Np. 15 laptop promocja"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => { void handleSearch() }}
              />
              <PrimaryButton disabled={isSearching} onPress={() => { void handleSearch() }}>
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
              >
                Wyczyść
              </SecondaryButton>
            </SearchRow>

            {searchError ? <AdminFeedbackText tone="danger">{searchError}</AdminFeedbackText> : null}
            {!searchError ? <AdminFeedbackText tone="neutral">{isSearching ? 'Trwa wyszukiwanie...' : searchMessage}</AdminFeedbackText> : null}

            {searchResults.length > 0 ? (
              <AdminResultsList>
                {searchResults.map((product) => (
                  <AdminResultCard key={product.id}>
                    <DataRow>
                      <AdminResultSummary>
                        <AdminResultTitle>{product.name}</AdminResultTitle>
                        <AdminResultMeta numberOfLines={2}>{product.description}</AdminResultMeta>
                      </AdminResultSummary>
                      <ProductPrice>{product.price.toFixed(2)} zł</ProductPrice>
                    </DataRow>

                    <DataRow>
                      <AdminResultMeta>ID</AdminResultMeta>
                      <AdminResultValue>{product.id}</AdminResultValue>
                    </DataRow>

                    <DataRow>
                      <AdminResultMeta>Stan magazynowy</AdminResultMeta>
                      <AdminResultValue>{product.amount}</AdminResultValue>
                    </DataRow>

                    <DataRow>
                      <AdminResultMeta>Kategorie</AdminResultMeta>
                      <AdminResultValueRight>{product.categories.join(', ')}</AdminResultValueRight>
                    </DataRow>

                    <ActionButtonRow>
                      <SecondaryButton onPress={() => handleSelectProduct(product)}>Edytuj</SecondaryButton>
                    </ActionButtonRow>
                  </AdminResultCard>
                ))}
              </AdminResultsList>
            ) : null}
          </AdminSectionCard>

          <AdminSectionCard>
            <AdminSectionHeader>
              <AdminSectionTitle>Wybrany produkt</AdminSectionTitle>
              <AdminHelperText>{selectedProductSummary}</AdminHelperText>
            </AdminSectionHeader>

            {selectedProduct ? (
              <WideFormCard>
                <YStack gap="$4">
                  <DataRow>
                    <AdminResultMeta>ID</AdminResultMeta>
                    <AdminResultValue>{selectedProduct.id}</AdminResultValue>
                  </DataRow>
                  <DataRow>
                    <AdminResultMeta>Nazwa</AdminResultMeta>
                    <AdminResultValue>{selectedProduct.name}</AdminResultValue>
                  </DataRow>
                  <DataRow>
                    <AdminResultMeta>Stan magazynowy</AdminResultMeta>
                    <AdminResultValue>{selectedProduct.amount}</AdminResultValue>
                  </DataRow>
                  <DataRow>
                    <AdminResultMeta>Kategorie</AdminResultMeta>
                    <AdminResultValueRight>{selectedProductCategories}</AdminResultValueRight>
                  </DataRow>
                  <ActionButtonRow>
                    <PrimaryButton onPress={() => setModalMode('edit')}>
                      Otwórz edycję
                    </PrimaryButton>
                    <SecondaryButton onPress={handleClearSelection}>
                      Wyczyść wybór
                    </SecondaryButton>
                  </ActionButtonRow>
                </YStack>
              </WideFormCard>
            ) : (
              <EmptyStateCard gap="$3">
                <Text fontSize="$8">⌕</Text>
                <AdminHelperText>Brak wybranego produktu do edycji.</AdminHelperText>
              </EmptyStateCard>
            )}
          </AdminSectionCard>
        </PageContent>
      </ScrollView>

      <Modal transparent visible={isModalOpen} animationType="fade" onRequestClose={closeModal}>
        <ModalBackdrop>
          <ModalCard>
            <ModalHeaderRow>
              <AdminSectionHeader flex={1}>
                <AdminSectionTitle>{modalTitle}</AdminSectionTitle>
                <AdminHelperText>{modalDescription}</AdminHelperText>
              </AdminSectionHeader>
              <SecondaryButton onPress={closeModal}>
                Zamknij
              </SecondaryButton>
            </ModalHeaderRow>

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
                      submitBehavior="submit"
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
                      submitBehavior="submit"
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
                      submitBehavior="submit"
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
                      submitBehavior="submit"
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
                      submitBehavior="submit"
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
                      submitBehavior="submit"
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

                  <ActionButtonRow>
                    <PrimaryButton
                      disabled={isSubmitting || isDeleting}
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
                      <SecondaryButton disabled={isSubmitting || isDeleting} onPress={handleClearSelection}>
                        Wyczyść wybór
                      </SecondaryButton>
                    ) : null}
                    {isEditMode ? (
                      <GhostDangerButton disabled={isSubmitting || isDeleting} onPress={() => { void handleDelete() }}>
                        Usuń produkt
                      </GhostDangerButton>
                    ) : null}
                  </ActionButtonRow>
                </YStack>
              ) : (
                <EmptyStateCard gap="$3">
                  <Text fontSize="$8">⌕</Text>
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