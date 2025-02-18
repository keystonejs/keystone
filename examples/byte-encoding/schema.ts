import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'

import type { Lists } from '.keystone/types'
import { bytes } from '@keystone-6/core/fields'
import { bytesScalar } from '@keystone-6/core/fields/types/bytes'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      // the default encoding for bytes is hex
      hex: bytes({ validation: { isRequired: true } }),
      base64: bytes({
        graphql: {
          scalar: bytesScalar({
            name: 'Base64',
            parse(value) {
              return Uint8Array.from(Buffer.from(value, 'base64'))
            },
            serialize(value) {
              return Buffer.from(value).toString('base64')
            },
          }),
        },
      }),
    },
  }),
} satisfies Lists
