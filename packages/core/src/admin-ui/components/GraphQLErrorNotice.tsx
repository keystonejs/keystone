import type { GraphQLFormattedError } from 'graphql'
import React from 'react'

import { VStack } from '@keystar/ui/layout'
import { Notice } from '@keystar/ui/notice'
import { Content } from '@keystar/ui/slots'
import { Heading, Text } from '@keystar/ui/typography'

type GraphQLErrorNoticeProps = {
  networkError: Error | null | undefined
  errors: readonly GraphQLFormattedError[] | undefined
}

export function GraphQLErrorNotice ({ errors, networkError }: GraphQLErrorNoticeProps) {
  if (networkError) {
    return (
      <Notice tone="critical">
        {networkError.message}
      </Notice>
    )
  }

  if (errors?.length) {
    if (errors.length === 1) {
      return (
        <Notice tone="critical">
          {errors[0].message}
        </Notice>
      )
    }

    return (
      <Notice tone="critical">
        <Heading>Errors</Heading>
        <Content>
          <VStack elementType="ul" gap="large">
            {errors.map((err, idx) => (
              <Text elementType="li" key={idx}>
                {err.message}
              </Text>
            ))}
          </VStack>
        </Content>
      </Notice>
    )
  }

  return null
}
