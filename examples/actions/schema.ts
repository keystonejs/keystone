import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { text, timestamp } from '@keystone-6/core/fields'

import type { Context, Lists } from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

const systemField = {
  access: {
    read: allowAll,
    create: denyAll,
    update: denyAll,
  },
  graphql: {
    omit: {
      create: true,
      update: true,
    },
  },
  ui: {
    createView: {
      fieldMode: 'hidden' as const,
    },
    itemView: {
      fieldMode: 'read' as const,
      fieldPosition: 'sidebar' as const,
    },
    listView: {
      fieldMode: 'read' as const,
    },
  },
}

export const lists = {
  Post: list({
    access: {
      operation: {
        query: allowAll, // WARNING: public
        create: allowAll, // WARNING: public
        update: allowAll, // WARNING: public
        delete: denyAll,
      },
    },
    fields: {
      title: text(),
      content: text(),
      reportedAt: timestamp({ ...systemField }),
    },
    graphql: {
      omit: {
        delete: true,
      },
    },
    actions: {
      // reportPost
      report: {
        access: allowAll,
        // null redirects to the list view, otherwise to the item view {for the returned item id}
        async resolve(context: Context, { actionKey, where }) {
          console.log(`${actionKey} called`, { where })
          if (!where) return null
          return await context.sudo().db.Post.updateOne({
            where,
            data: {
              reportedAt: new Date(),
            },
          })
        },
        ui: {
          label: 'Report',
          verb: 'report',
          tone: 'critical',
          itemView: {
            actionMode: () => 'enabled',
          },
          listView: {
            actionMode: 'enabled',
          },
        },
      },
    },
  }),
} satisfies Lists
