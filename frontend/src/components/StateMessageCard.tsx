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
      borderWidth={1}
      borderColor={isDanger ? '#f2b8b5' : '$borderColor'}
      bg={isDanger ? '#ffdad6' : '$backgroundHover'}
      style={{
        width: '100%',
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 36,
      }}
    >
      <YStack
        alignItems="center"
        justifyContent="center"
        borderWidth={1}
        borderColor={isDanger ? '#f2b8b5' : '$borderColor'}
        bg="$background"
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
        }}
      >
        <Text color={isDanger ? '$red10' : '$stitchPrimary'} fontFamily="$heading" fontSize="$8" lineHeight="$8">
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