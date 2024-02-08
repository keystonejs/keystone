import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { integer, text } from '@keystone-6/core/fields'

import { type Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      version: integer({
        defaultValue: 0,
        validation: { isRequired: true },
        db: { isNullable: false },
        graphql: {
          isNonNull: {
            // read: true, // unnecessary
            // create: true, // unnecessary, defaultValue is OK
            update: true, // required
          },
        },
        ui: {
          itemView: {
            fieldMode: 'read', // no manually editing this
          },
        },
        hooks: {
          resolveInput: async ({ resolvedData, operation, item }) => {
            if (operation === 'create') return resolvedData.version
            if (resolvedData.version !== item.version) throw new Error('Out of sync')

            return item.version + 1
          },
        },
      }),
    },
  }),
} satisfies Lists
