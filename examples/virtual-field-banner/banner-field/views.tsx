import { VStack } from '@keystar/ui/layout'
import { Notice } from '@keystar/ui/notice'
import { Content } from '@keystar/ui/slots'
import { Heading, Text } from '@keystar/ui/typography'

import type { controller } from '@keystone-6/core/fields/types/virtual/views'
import type { FieldProps } from '@keystone-6/core/types'

export function Field({
  value,
}: FieldProps<typeof controller> & { value: { messages: string[] } }) {
  const { messages } = value ?? {}
  if (!messages?.length) return null

  return (
    <Notice tone="neutral">
      <Heading>A neutral heading</Heading>
      <Content>
        <VStack elementType="ul" gap="large">
          {[
            ...(function* () {
              let i = 0
              for (const message of messages) {
                const lines = message.split('\n')
                for (const line of lines) {
                  yield (
                    <Text key={i++} elementType="li">
                      {line}
                    </Text>
                  )
                }
              }
            })(),
          ]}
        </VStack>
      </Content>
    </Notice>
  )
}
