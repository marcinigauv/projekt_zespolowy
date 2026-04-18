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
    return apiRequest<ProductDto[]>(`/products/similar/?product_id=${payload.id}`, {
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

