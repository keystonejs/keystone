import { list, g } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text } from '@keystone-6/core/fields'

export const lists = {
  Something: list({
    access: allowAll,
    fields: {
      text: text({ ui: { label: 'Initial Label For Text' } }),
      anotherField: text(),
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
