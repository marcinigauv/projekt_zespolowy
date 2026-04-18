import { ApiError, NetworkError } from '../lib/api'
import {
  createProductApi,
  deleteProductApi,
  fetchProductDetailsApi,
  fetchProductListApi,
  fetchProductSimilarApi,
  updateProductApi,
  type ProductDetailsRequestDto,
  type ProductDto,
  type ProductListRequestDto,
  type ProductSimilarRequestDto,
  type ProductUpsertDto,
} from './api'
import {
  InvalidProductInputError,
  InvalidProductIdError,
  InvalidProductListInputError,
  ProductForbiddenError,
  ProductOfflineError,
  ProductNotFoundError,
  ProductServiceUnavailableError,
} from './exceptions'

const DEFAULT_PRODUCT_LIST_LIMIT = 50
const DEFAULT_PRODUCT_LIST_OFFSET = 0

export type Product = ProductDto

export interface GetProductsCommand {
  limit?: number
  offset?: number
  substring?: string
  category?: string
  sortingField?: ProductListRequestDto['sortingField']
  sortingOrder?: ProductListRequestDto['sortingOrder']
}

export interface GetProductCommand extends ProductDetailsRequestDto {}

export interface GetSimilarProductsCommand extends ProductSimilarRequestDto {}

export interface UpsertProductCommand {
  name: string
  description: string
  price: number
  amount: number
  categories: string[]
  imageUrl?: string | null
}

export interface UpdateProductCommand extends UpsertProductCommand {
  id: number
}

export interface DeleteProductCommand {
  id: number
}

export interface SearchAdminProductsCommand {
  query: string
}

function validateProductId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new InvalidProductIdError()
  }
}

function normalizeListCommand(command: GetProductsCommand): ProductListRequestDto {
  const limit = command.limit ?? DEFAULT_PRODUCT_LIST_LIMIT
  const offset = command.offset ?? DEFAULT_PRODUCT_LIST_OFFSET
  const substring = command.substring?.trim() ?? ''
  const category = command.category?.trim() ?? ''

  if (!Number.isInteger(limit) || limit <= 1) {
    throw new InvalidProductListInputError('Parametr limit musi być liczbą całkowitą większą od 1')
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new InvalidProductListInputError('Parametr offset nie może być mniejszy od 0')
  }

  return {
    limit,
    offset,
    substring,
    category,
    sortingField: command.sortingField,
    sortingOrder: command.sortingOrder,
  }
}

function mapListError(error: unknown): Error {
  if (error instanceof NetworkError) {
    return new ProductOfflineError()
  }

  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 422) {
      return new InvalidProductListInputError('Nieprawidłowe parametry wyszukiwania produktów')
    }

    return new ProductServiceUnavailableError()
  }

  return error instanceof Error ? error : new ProductServiceUnavailableError()
}

function mapProductError(error: unknown, productId: number): Error {
  if (error instanceof NetworkError) {
    return new ProductOfflineError()
  }

  if (error instanceof ApiError) {
    if (error.status === 404) {
      return new ProductNotFoundError(productId)
    }

    if (error.status === 400 || error.status === 422) {
      return new InvalidProductIdError()
    }

    return new ProductServiceUnavailableError()
  }

  return error instanceof Error ? error : new ProductServiceUnavailableError()
}

export async function getProductsUseCase(command: GetProductsCommand = {}): Promise<Product[]> {
  try {
    return await fetchProductListApi(normalizeListCommand(command))
  } catch (error) {
    throw mapListError(error)
  }
}

export async function getProductUseCase(command: GetProductCommand): Promise<Product> {
  validateProductId(command.id)

  try {
    return await fetchProductDetailsApi(command)
  } catch (error) {
    throw mapProductError(error, command.id)
  }
}

export async function getSimilarProductsUseCase(
  command: GetSimilarProductsCommand,
): Promise<Product[]> {
  validateProductId(command.id)

  try {
    return await fetchProductSimilarApi(command)
  } catch (error) {
    throw mapProductError(error, command.id)
  }
}

function normalizeProductCommand(command: UpsertProductCommand): ProductUpsertDto {
  const name = command.name.trim()
  const description = command.description.trim()
  const categories = command.categories
    .map((category) => category.trim())
    .filter((category) => category.length > 0)
  const imageUrl = command.imageUrl?.trim() ?? ''

  if (!name) {
    throw new InvalidProductInputError('Nazwa produktu jest wymagana')
  }

  if (!description) {
    throw new InvalidProductInputError('Opis produktu jest wymagany')
  }

  if (typeof command.price !== 'number' || Number.isNaN(command.price) || command.price <= 0) {
    throw new InvalidProductInputError('Cena produktu musi być większa od 0')
  }

  if (!Number.isInteger(command.amount) || command.amount < 0) {
    throw new InvalidProductInputError('Stan magazynowy nie może być mniejszy od 0')
  }

  if (categories.length === 0) {
    throw new InvalidProductInputError('Produkt musi mieć przynajmniej jedną kategorię')
  }

  return {
    name,
    description,
    price: command.price,
    amount: command.amount,
    categories,
    imageUrl: imageUrl || null,
  }
}

function mapProductMutationError(error: unknown, productId?: number): Error {
  if (error instanceof NetworkError) {
    return new ProductOfflineError()
  }

  if (error instanceof ApiError) {
    if (error.status === 403) {
      return new ProductForbiddenError()
    }

    if (error.status === 404) {
      return new ProductNotFoundError(productId)
    }

    if (error.status === 400 || error.status === 422) {
      return new InvalidProductInputError('Nieprawidłowe dane produktu')
    }

    return new ProductServiceUnavailableError()
  }

  return error instanceof Error ? error : new ProductServiceUnavailableError()
}

function parseAdminSearchTokens(query: string): { ids: number[]; substrings: string[] } {
  const tokens = query
    .trim()
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)

  const ids = new Set<number>()
  const substrings = new Set<string>()

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      const parsedId = Number(token)

      if (Number.isInteger(parsedId) && parsedId > 0) {
        ids.add(parsedId)
      }

      continue
    }

    substrings.add(token)
  }

  return {
    ids: [...ids],
    substrings: [...substrings],
  }
}

function mergeProducts(products: Product[]): Product[] {
  const uniqueProducts = new Map<number, Product>()

  for (const product of products) {
    uniqueProducts.set(product.id, product)
  }

  return [...uniqueProducts.values()].sort((left, right) => left.id - right.id)
}

export async function createProductUseCase(command: UpsertProductCommand): Promise<Product> {
  try {
    return await createProductApi(normalizeProductCommand(command))
  } catch (error) {
    throw mapProductMutationError(error)
  }
}

export async function updateProductUseCase(command: UpdateProductCommand): Promise<Product> {
  validateProductId(command.id)

  try {
    return await updateProductApi(command.id, normalizeProductCommand(command))
  } catch (error) {
    throw mapProductMutationError(error, command.id)
  }
}

export async function deleteProductUseCase(command: DeleteProductCommand): Promise<boolean> {
  validateProductId(command.id)

  try {
    return await deleteProductApi(command.id)
  } catch (error) {
    throw mapProductMutationError(error, command.id)
  }
}

export async function searchAdminProductsUseCase(
  command: SearchAdminProductsCommand,
): Promise<Product[]> {
  const query = command.query.trim()

  if (!query) {
    return []
  }

  const { ids, substrings } = parseAdminSearchTokens(query)

  if (ids.length === 0 && substrings.length === 0) {
    return []
  }

  const productResults = await Promise.all([
    ...ids.map(async (id) => {
      try {
        return await getProductUseCase({ id })
      } catch (error) {
        if (error instanceof ProductNotFoundError) {
          return null
        }

        throw error
      }
    }),
    ...substrings.map((substring) => getProductsUseCase({ substring, category: '' })),
  ])

  return mergeProducts(
    productResults.flatMap((result) => {
      if (result === null) {
        return []
      }

      return Array.isArray(result) ? result : [result]
    }),
  )
}