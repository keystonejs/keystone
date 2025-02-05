import { g, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

export const lists = {
  Something: list({
    access: allowAll,
    fields: {
      text: text({ label: 'Initial Label For Text' }),
    },
  }),
}

export const extendGraphqlSchema = g.extend(() => {
  return {
    query: {
      someNumber: g.field({
        type: g.Int,
        resolve: () => 1,
      }),
    },
  }
})
