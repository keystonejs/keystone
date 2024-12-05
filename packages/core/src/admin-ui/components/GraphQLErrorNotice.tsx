import React from 'react'

import { VStack } from '@keystar/ui/layout'
import { Notice } from '@keystar/ui/notice'
import { Content } from '@keystar/ui/slots'
import { Heading, Text } from '@keystar/ui/typography'

import type {
  GraphQLError,
  GraphQLFormattedError
} from 'graphql'

export function GraphQLErrorNotice ({
  errors: errors_ = []
}: {
  errors?: (
    | null
    | undefined
    | GraphQLError
    | GraphQLFormattedError
    | Error
  )[]
}) {
  const errors = errors_.filter((x): x is NonNullable<typeof x> => !!x)
  if (!errors.length) return null
  if (errors.length === 1) return <Notice tone="critical">{errors[0].message}</Notice>

  return (
    <Notice tone="critical">
      <Heading>Errors</Heading>
      <Content>
        <VStack elementType="ul" gap="large">
          {errors.map((err, i) => (
            <Text elementType="li" key={i}>{err.message}</Text>
          ))}
        </VStack>
      </Content>
    </Notice>
  )
}
