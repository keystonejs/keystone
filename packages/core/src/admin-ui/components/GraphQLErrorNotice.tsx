import type { ServerError, ServerParseError } from '@apollo/client'
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
  )[]
}) {
  const errors = errors_.filter((x): x is NonNullable<typeof x> => !!x)
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

                if ('result' in error && typeof error.result !== 'string') {
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
