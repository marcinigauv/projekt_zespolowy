import { useEffect, useState } from 'react'
import {
  getProductRatingAverageUseCase,
  type ProductRatingAverage,
} from '../useCases'

interface ProductIdentity {
  id: number
}

type ProductRatingAveragesMap = Record<number, ProductRatingAverage | null>

export function useProductRatingAverages(products: ProductIdentity[]): ProductRatingAveragesMap {
  const [ratingAverages, setRatingAverages] = useState<ProductRatingAveragesMap>({})

  useEffect(() => {
    let isMounted = true

    if (products.length === 0) {
      setRatingAverages({})
      return () => {
        isMounted = false
      }
    }

    const loadRatingAverages = async () => {
      const settledResults = await Promise.allSettled(
        products.map(async (product) => ({
          productId: product.id,
          average: await getProductRatingAverageUseCase({ id: product.id }),
        })),
      )

      if (!isMounted) {
        return
      }

      const nextRatingAverages: ProductRatingAveragesMap = {}

      for (const result of settledResults) {
        if (result.status === 'fulfilled') {
          nextRatingAverages[result.value.productId] = result.value.average
        }
      }

      for (const product of products) {
        if (!(product.id in nextRatingAverages)) {
          nextRatingAverages[product.id] = null
        }
      }

      setRatingAverages(nextRatingAverages)
    }

    void loadRatingAverages()

    return () => {
      isMounted = false
    }
  }, [products])

  return ratingAverages
}