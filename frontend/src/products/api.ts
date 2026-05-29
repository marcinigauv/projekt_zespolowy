import { apiRequest } from '../lib/api'

export interface ProductDto {
    id: number
    name: string
    description: string
    price: number
    amount: number
    categories: string[]
    imageUrl?: string | null
}

export interface ProductUpsertDto {
    name: string
    description: string
    price: number
    amount: number
    categories: string[]
    imageUrl?: string | null
}

export interface ProductDetailsRequestDto {
    id: number
}

export interface ProductSimilarRequestDto {
    id: number
}

export interface ProductRecommendedForYouRequestDto {
    id: number
}

export interface ProductRatingCreateDto {
    rating: number
}

export interface ProductRatingDto {
    productId: number
    userId: number
    rating: number
}

export interface ProductRatingAverageDto {
    productId: number
    averageRating: number | null
    ratingsCount: number
}

export interface ProductCurrentUserRatingDto {
    productId: number
    userId: number
    rating: number | null
}

export type ProductSortingField = 'name' | 'price' | 'amount'
export type ProductSortingOrder = 'asc' | 'desc'

export interface ProductListRequestDto {
    limit: number
    offset: number
    substring?: string
    category: string
    sortingField?: ProductSortingField
    sortingOrder?: ProductSortingOrder
}

export async function fetchProductListApi(payload: ProductListRequestDto): Promise<ProductDto[]> {
    return apiRequest<ProductDto[]>('/products/', {
        method: 'POST',
        body: payload,
    })
}

export async function fetchProductDetailsApi(payload: ProductDetailsRequestDto): Promise<ProductDto> {
    return apiRequest<ProductDto>(`/products/?product_id=${payload.id}`, {
        method: 'GET',
    })
}

export async function fetchProductSimilarApi(payload: ProductSimilarRequestDto): Promise<ProductDto[]> {
    return apiRequest<ProductDto[]>(`/products/similar?product_id=${payload.id}`, {
        method: 'GET',
    })
}

export async function fetchProductRecommendedForYouApi(payload: ProductRecommendedForYouRequestDto): Promise<ProductDto[]> {
    return apiRequest<ProductDto[]>(`/products/recommended-for-you?product_id=${payload.id}`, {
        method: 'GET',
    })
}

export async function createOrUpdateProductRatingApi(productId: number, payload: ProductRatingCreateDto): Promise<ProductRatingDto> {
    return apiRequest<ProductRatingDto>(`/products/${productId}/rating`, {
        method: 'POST',
        body: payload,
    })
}

export async function fetchProductRatingAverageApi(productId: number): Promise<ProductRatingAverageDto> {
    return apiRequest<ProductRatingAverageDto>(`/products/${productId}/rating/average`, {
        method: 'GET',
    })
}

export async function fetchCurrentUserProductRatingApi(productId: number): Promise<ProductCurrentUserRatingDto> {
    return apiRequest<ProductCurrentUserRatingDto>(`/products/${productId}/rating/me`, {
        method: 'GET',
    })
}

export async function createProductApi(payload: ProductUpsertDto): Promise<ProductDto> {
    return apiRequest<ProductDto>('/products/add', {
        method: 'POST',
        body: payload,
    })
}

export async function updateProductApi(id: number, payload: ProductUpsertDto): Promise<ProductDto> {
    return apiRequest<ProductDto>(`/products/${id}`, {
        method: 'PUT',
        body: payload,
    })
}

export async function deleteProductApi(id: number): Promise<boolean> {
    return apiRequest<boolean>(`/products/${id}`, {
        method: 'DELETE',
    })
}

