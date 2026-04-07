import { ApiError, NetworkError } from '../lib/api'
import {
  fetchProductDetailsApi,
  fetchProductListApi,
  fetchProductSimilarApi,
  type ProductDetailsRequestDto,
  type ProductDto,
  type ProductListRequestDto,
  type ProductSimilarRequestDto,
} from './api'
import {
  InvalidProductIdError,
  InvalidProductListInputError,
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