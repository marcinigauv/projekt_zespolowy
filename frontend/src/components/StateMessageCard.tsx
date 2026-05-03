import React from 'react'
import { Text } from 'tamagui'
import { EmptyStateCard } from './styled'

interface StateMessageCardProps {
  icon: string
  message: string
  tone?: 'muted' | 'danger'
}

export function StateMessageCard({ icon, message, tone = 'muted' }: StateMessageCardProps) {
  return (
    <EmptyStateCard gap="$3">
      <Text fontSize="$8">{icon}</Text>
      <Text color={tone === 'danger' ? '$red10' : '$gray10'} fontSize="$5">
        {message}
      </Text>
    </EmptyStateCard>
  )
}