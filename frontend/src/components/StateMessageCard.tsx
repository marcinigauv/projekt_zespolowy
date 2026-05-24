import React from 'react'
import { Text, YStack } from 'tamagui'
import { EmptyStateCard } from './styled'

interface StateMessageCardProps {
  icon: string
  message: string
  tone?: 'muted' | 'danger'
}

export function StateMessageCard({ icon, message, tone = 'muted' }: StateMessageCardProps) {
  const isDanger = tone === 'danger'

  return (
    <EmptyStateCard
      gap="$3"
      style={{
        width: '100%',
        borderWidth: 1,
        borderColor: isDanger ? '#f2b8b5' : '#cbc4d2',
        borderRadius: 24,
        backgroundColor: isDanger ? '#ffdad6' : '#f8f2fa',
        paddingHorizontal: 24,
        paddingVertical: 36,
      }}
    >
      <YStack
        alignItems="center"
        justifyContent="center"
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          borderWidth: 1,
          borderColor: isDanger ? '#f2b8b5' : '#cbc4d2',
          backgroundColor: '#ffffff',
        }}
      >
        <Text color={isDanger ? '$red10' : '$blue10'} fontFamily="$heading" fontSize="$8" lineHeight="$8">
          {icon}
        </Text>
      </YStack>

      <Text
        color={isDanger ? '$red10' : '$color'}
        fontSize="$5"
        fontWeight="700"
        lineHeight="$6"
        textAlign="center"
        maxWidth={560}
      >
        {message}
      </Text>
    </EmptyStateCard>
  )
}