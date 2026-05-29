import React from 'react'
import { Text, XStack } from 'tamagui'
import type { ProductRatingAverage } from '../useCases'

const PRODUCT_RATING_VALUES = [1, 2, 3, 4, 5] as const
const RATING_FILLED_STAR_COLOR = '#F5B301'
const RATING_EMPTY_STAR_COLOR = '#A6ADBA'

interface ProductRatingSummaryProps {
  ratingAverage?: ProductRatingAverage | null
  isLoading?: boolean
  starSize?: number
}

function shouldShowRating(
  ratingAverage?: ProductRatingAverage | null,
): ratingAverage is ProductRatingAverage {
  if (!ratingAverage) {
    return false
  }

  if (ratingAverage.ratingsCount <= 0) {
    return false
  }

  if (ratingAverage.averageRating === null) {
    return false
  }

  return ratingAverage.averageRating > 0
}

export function ProductRatingSummary({
  ratingAverage,
  isLoading = false,
  starSize = 14,
}: ProductRatingSummaryProps) {
  if (isLoading) {
    return (
      <Text color="$placeholderColor" fontFamily="$mono" fontSize="$2" lineHeight="$3" fontWeight="500">
        Ładowanie opinii...
      </Text>
    )
  }

  if (!shouldShowRating(ratingAverage)) {
    return (
      <Text color="$placeholderColor" fontFamily="$mono" fontSize="$2" lineHeight="$3" fontWeight="500">
        Brak opinii
      </Text>
    )
  }

  const averageRatingValue = ratingAverage.averageRating
  const roundedStars = Math.max(1, Math.min(5, Math.round(averageRatingValue)))

  return (
    <XStack alignItems="center" gap="$1.5" flexWrap="wrap">
      <XStack alignItems="center" gap={2}>
        {PRODUCT_RATING_VALUES.map((ratingValue) => (
          <Text
            key={ratingValue}
            style={{
              color: ratingValue <= roundedStars ? RATING_FILLED_STAR_COLOR : RATING_EMPTY_STAR_COLOR,
              fontSize: starSize,
              lineHeight: starSize + 2,
            }}
          >
            ★
          </Text>
        ))}
      </XStack>

      <Text color="$color" fontFamily="$mono" fontSize="$2" lineHeight="$3" fontWeight="700">
        {averageRatingValue.toFixed(1)}
      </Text>
    </XStack>
  )
}