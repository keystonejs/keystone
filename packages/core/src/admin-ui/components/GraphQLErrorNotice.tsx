import { Stack } from '@keystone-ui/core'
import { Notice } from '@keystone-ui/notice'
import type { GraphQLFormattedError } from 'graphql'
import React from 'react'

type GraphQLErrorNoticeProps = {
  networkError: Error | null | undefined
  errors: readonly GraphQLFormattedError[] | undefined
}

export function GraphQLErrorNotice ({ errors, networkError }: GraphQLErrorNoticeProps) {
  if (networkError) {
    return (
      <Notice tone="negative" marginBottom="large">
        {networkError.message}
      </Notice>
    )
  }
  if (errors?.length) {
    return (
      <Stack gap="small" marginBottom="large">
        {errors.map((err, idx) => (
          <Notice tone="negative" key={idx}>
            {err.message}
          </Notice>
        ))}
      </Stack>
    )
  }
  return null
}
