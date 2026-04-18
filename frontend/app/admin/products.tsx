import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Label, ScrollView, Text, YStack } from 'tamagui'
import { Header } from '../../src/components/Header'
import {
  createProductUseCase,
  deleteProductUseCase,
  searchAdminProductsUseCase,
  type Product,
  updateProductUseCase,
} from '../../src/products/useCases'
import { useAuthStore } from '../../src/store/authStore'
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
  const { isAuthenticated, user } = useAuthStore()
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (!user?.isAdmin) {
      router.replace('/')
    }
  }, [isAuthenticated, router, user?.isAdmin])

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
    } catch (caughtError) {
      setEditError(caughtError instanceof Error ? caughtError.message : 'Nie udało się usunąć produktu')
    } finally {
      setIsDeleting(false)
    }
  }

  const selectedProductCategories = selectedProduct?.categories.join(', ') ?? ''

  if (!isAuthenticated || !user?.isAdmin) {
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
                      <SecondaryButton onPress={() => handleSelectProduct(product)}>Wybierz do edycji</SecondaryButton>
                    </ActionButtonRow>
                  </AdminResultCard>
                ))}
              </AdminResultsList>
            ) : null}
          </AdminSectionCard>

          <AdminSectionCard>
            <AdminSectionHeader>
              <AdminSectionTitle>Edytuj wybrany produkt</AdminSectionTitle>
              <AdminHelperText>
                {selectedProduct
                  ? `Wybrany produkt: #${selectedProduct.id} • ${selectedProduct.name}`
                  : 'Najpierw wyszukaj i wybierz konkretny produkt z wyników.'}
              </AdminHelperText>
            </AdminSectionHeader>

            {selectedProduct ? (
              <WideFormCard>
                <YStack gap="$4">
                  <FormField>
                    <Label htmlFor="edit-product-name">Nazwa</Label>
                    <FormInput id="edit-product-name" value={editForm.name} onChangeText={(value) => handleFormChange('edit', 'name', value)} />
                  </FormField>

                  <FormField>
                    <Label htmlFor="edit-product-description">Opis</Label>
                    <FormInput id="edit-product-description" value={editForm.description} onChangeText={(value) => handleFormChange('edit', 'description', value)} multiline />
                  </FormField>

                  <FormField>
                    <Label htmlFor="edit-product-price">Cena</Label>
                    <FormInput id="edit-product-price" value={editForm.price} onChangeText={(value) => handleFormChange('edit', 'price', value)} keyboardType="decimal-pad" />
                  </FormField>

                  <FormField>
                    <Label htmlFor="edit-product-amount">Stan magazynowy</Label>
                    <FormInput id="edit-product-amount" value={editForm.amount} onChangeText={(value) => handleFormChange('edit', 'amount', value)} keyboardType="number-pad" />
                  </FormField>

                  <FormField>
                    <Label htmlFor="edit-product-categories">Kategorie</Label>
                    <FormInput id="edit-product-categories" value={editForm.categories} onChangeText={(value) => handleFormChange('edit', 'categories', value)} />
                  </FormField>

                  <FormField>
                    <Label htmlFor="edit-product-image-url">URL obrazu</Label>
                    <FormInput id="edit-product-image-url" value={editForm.imageUrl} onChangeText={(value) => handleFormChange('edit', 'imageUrl', value)} autoCapitalize="none" />
                  </FormField>

                  {editError ? <AdminFeedbackText tone="danger">{editError}</AdminFeedbackText> : null}
                  {editSuccessMessage ? <AdminFeedbackText tone="success">{editSuccessMessage}</AdminFeedbackText> : null}

                  <ActionButtonRow>
                    <PrimaryButton disabled={isSubmitting || isDeleting} onPress={() => { void handleUpdateProduct() }}>
                      Zapisz zmiany
                    </PrimaryButton>
                    <SecondaryButton disabled={isSubmitting || isDeleting} onPress={() => setEditForm(toFormState(selectedProduct))}>
                      Przywróć dane
                    </SecondaryButton>
                    <SecondaryButton disabled={isSubmitting || isDeleting} onPress={handleClearSelection}>
                      Zmień wybór
                    </SecondaryButton>
                    <GhostDangerButton disabled={isSubmitting || isDeleting} onPress={() => { void handleDelete() }}>
                      Usuń produkt
                    </GhostDangerButton>
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

          <AdminSectionCard>
            <AdminSectionHeader>
              <AdminSectionTitle>Dodaj nowy produkt</AdminSectionTitle>
              <AdminHelperText>
                Tworzenie nowego produktu jest niezależne od wyszukiwania i wyboru produktu do edycji.
              </AdminHelperText>
            </AdminSectionHeader>

            <WideFormCard>
              <YStack gap="$4">
                <FormField>
                  <Label htmlFor="create-product-name">Nazwa</Label>
                  <FormInput id="create-product-name" value={createForm.name} onChangeText={(value) => handleFormChange('create', 'name', value)} />
                </FormField>

                <FormField>
                  <Label htmlFor="create-product-description">Opis</Label>
                  <FormInput id="create-product-description" value={createForm.description} onChangeText={(value) => handleFormChange('create', 'description', value)} multiline />
                </FormField>

                <FormField>
                  <Label htmlFor="create-product-price">Cena</Label>
                  <FormInput id="create-product-price" value={createForm.price} onChangeText={(value) => handleFormChange('create', 'price', value)} keyboardType="decimal-pad" />
                </FormField>

                <FormField>
                  <Label htmlFor="create-product-amount">Stan magazynowy</Label>
                  <FormInput id="create-product-amount" value={createForm.amount} onChangeText={(value) => handleFormChange('create', 'amount', value)} keyboardType="number-pad" />
                </FormField>

                <FormField>
                  <Label htmlFor="create-product-categories">Kategorie</Label>
                  <FormInput id="create-product-categories" value={createForm.categories} onChangeText={(value) => handleFormChange('create', 'categories', value)} />
                </FormField>

                <FormField>
                  <Label htmlFor="create-product-image-url">URL obrazu</Label>
                  <FormInput id="create-product-image-url" value={createForm.imageUrl} onChangeText={(value) => handleFormChange('create', 'imageUrl', value)} autoCapitalize="none" />
                </FormField>

                {createError ? <AdminFeedbackText tone="danger">{createError}</AdminFeedbackText> : null}
                {createSuccessMessage ? <AdminFeedbackText tone="success">{createSuccessMessage}</AdminFeedbackText> : null}

                <ActionButtonRow>
                  <PrimaryButton disabled={isSubmitting || isDeleting} onPress={() => { void handleCreateProduct() }}>
                    Dodaj produkt
                  </PrimaryButton>
                  <SecondaryButton disabled={isSubmitting || isDeleting} onPress={handleCreateReset}>
                    Wyczyść formularz
                  </SecondaryButton>
                </ActionButtonRow>
              </YStack>
            </WideFormCard>
          </AdminSectionCard>

          {selectedProduct ? (
            <AdminSectionCard>
              <AdminSectionHeader>
                <AdminSectionTitle>Aktualnie wybrany produkt</AdminSectionTitle>
                <AdminHelperText>
                  Ten skrót potwierdza, który rekord jest właśnie edytowany.
                </AdminHelperText>
              </AdminSectionHeader>

              <DataRow>
                <AdminResultMeta>ID</AdminResultMeta>
                <AdminResultValue>{selectedProduct.id}</AdminResultValue>
              </DataRow>
              <DataRow>
                <AdminResultMeta>Nazwa</AdminResultMeta>
                <AdminResultValue>{selectedProduct.name}</AdminResultValue>
              </DataRow>
              <DataRow>
                <AdminResultMeta>Stan</AdminResultMeta>
                <AdminResultValue>{selectedProduct.amount}</AdminResultValue>
              </DataRow>
              <DataRow>
                <AdminResultMeta>Kategorie</AdminResultMeta>
                <AdminResultValueRight>{selectedProductCategories}</AdminResultValueRight>
              </DataRow>
            </AdminSectionCard>
          ) : null}
        </PageContent>
      </ScrollView>
    </PageWrapper>
  )
}