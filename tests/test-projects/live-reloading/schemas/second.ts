import { g, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, virtual } from '@keystone-6/core/fields'

import type { Lists } from '.keystone/types'

export const lists = {
  Something: list({
    access: allowAll,
    fields: {
      text: text({ label: 'Very Important Text' }),
      virtual: virtual({
        field: g.field({
          type: g.String,
          resolve (item) {
            return item.text
          },
        }),
      }),
    },
  }),
} satisfies Lists

export const extendGraphqlSchema = g.extend(() => {
  return {
    query: {
      someNumber: g.field({
        type: g.nonNull(g.Int),
        resolve: () => 1,
      }),
    },
  }
})
