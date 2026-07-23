import { action, g, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { integer, text } from '@keystone-6/core/fields'

import type { Lists } from './generated/keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    ui: {
      listView: {
        initialColumns: ['title'],
      },
    },
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
            fieldPosition: 'sidebar',
          },
        },
        hooks: {
          resolveInput: {
            update: async ({ resolvedData, item }) => {
              if (resolvedData.version !== item.version) throw new Error('Out of sync')

              return item.version + 1
            },
          },
        },
      }),
    },
    actions: {
      copy: action({
        access: allowAll,
        ui: {
          label: 'Copy',
        },
        args: {
          version: {
            graphql: g.arg({ type: g.nonNull(g.Int) }),
            ui: {
              source: { itemField: 'version' },
            },
          },
        },
        resolve: async ({ where, args: { version } }, context) => {
          const item = await context.db.Post.findOne({ where })
          if (!item) return null
          if (version !== item.version) throw new Error('Out of sync')

          return context.db.Post.createOne({
            data: {
              content: item.content,
              version: 1,
              title: `Copy of ${item.title}`,
            },
          })
        },
      }),
    },
  }),
} satisfies Lists
