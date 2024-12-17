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

  return (
    <Notice tone="critical">
      <Heading>Errors</Heading>
      <Content>
        <VStack elementType="ul" gap="large">
          {[...function* () {
            let i = 0
            for (const error of errors) {
              const lines = error.message.split('\n')
              for (const line of lines) {
                yield <Text elementType="li" key={i++}>{line}</Text>
              }
            }
          }()]}
        </VStack>
      </Content>
    </Notice>
  )
}
