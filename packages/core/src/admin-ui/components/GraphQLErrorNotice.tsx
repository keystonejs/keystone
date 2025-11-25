import {
  CombinedGraphQLErrors,
  type ErrorLike,
  type ServerError,
  type ServerParseError,
} from '@apollo/client'
import type { GraphQLError, GraphQLFormattedError } from 'graphql'

import { VStack } from '@keystar/ui/layout'
import { Notice } from '@keystar/ui/notice'
import { Content } from '@keystar/ui/slots'
import { Heading, Text } from '@keystar/ui/typography'

export function GraphQLErrorNotice({
  errors: errors_ = [],
}: {
  errors?: (
    | null
    | undefined
    | ServerError
    | ServerParseError
    | GraphQLError
    | GraphQLFormattedError
    | Error
    | ErrorLike
  )[]
}) {
  let errors = errors_.flatMap(x => {
    if (!x) return []
    if (CombinedGraphQLErrors.is(x)) {
      return x.errors
    }
    return x
  })
  if (!errors.length) return null

  return (
    <Notice tone="critical">
      <Heading>Errors</Heading>
      <Content>
        <VStack elementType="ul" gap="large">
          {[
            ...(function* () {
              let i = 0
              for (const error of errors) {
                const lines = error.message.split('\n')
                for (const line of lines) {
                  yield (
                    <Text key={i++} elementType="li">
                      {line}
                    </Text>
                  )
                }

                if (
                  'result' in error &&
                  typeof error.result === 'object' &&
                  error.result !== null &&
                  'errors' in error.result &&
                  Array.isArray(error.result.errors)
                ) {
                  for (const { message } of error.result.errors) {
                    if (typeof message !== 'string') continue
                    yield (
                      <Text key={i++} elementType="li">
                        {message}
                      </Text>
                    )
                  }
                }
              }
            })(),
          ]}
        </VStack>
      </Content>
    </Notice>
  )
}
