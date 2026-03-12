import { action, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, integer, text } from '@keystone-6/core/fields'

import { type Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    ui: {
      listView: {
        initialColumns: ['title', 'isPublished'],
      },
    },
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text(),
      isPublished: checkbox({
        graphql: {
          omit: {
            create: true,
            update: true,
          },
        },
      }),
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
          resolveInput: {
            update: async ({ resolvedData, operation, item }) => {
              if (resolvedData.version !== item.version) throw new Error('Out of sync')

              return item.version + 1
            },
          },
        },
      }),
    },
    actions: {
      publish: action({
        access: allowAll,
        ui: {
          label: 'Publish',
          itemView: { actionMode: { enabled: true } },
        },
        graphql: {
          __data: {
            version: true,
          },
        },
        resolve: async ({ where, data }, context) => {
          return context.sudo().db.Post.updateOne({
            where,
            data: {
              isPublished: true,
              version: data.version,
            },
          })
        },
      }),
    },
  }),
} satisfies Lists
