import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { checkbox, text, timestamp } from '@keystone-6/core/fields'

import type { Lists } from '.keystone/types'
import { BaseListTypeInfo } from '@keystone-6/core/types'

const readOnlyField = {
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
      fieldMode: () => 'hidden' as const,
    },
    itemView: {
      fieldMode: () => 'read' as const,
      fieldPosition: () => 'sidebar' as const,
    },
    listView: {
      fieldMode: () => 'read' as const,
    },
  },
}

// we use this function to show that completed is a boolean type
//   which would be missing if the types were unrefined
//   a common problem when re-using code
function isTrue(b: boolean) {
  return b === true
}

type CompatibleLists = BaseListTypeInfo & { item: { completed: boolean } }

function trackingFields<ListTypeInfo extends CompatibleLists>() {
  return {
    createdBy: text<ListTypeInfo>({
      ...readOnlyField,
      hooks: {
        resolveInput: {
          async create({ context }) {
            return `${context.req?.socket.remoteAddress} (${context.req?.headers['user-agent']})`
          },
          async update() {
            return undefined
          },
        },
      },
    }),
    createdAt: timestamp<ListTypeInfo>({
      ...readOnlyField,
      hooks: {
        resolveInput: {
          async create() {
            return new Date()
          },
          async update() {
            return undefined
          },
        },
      },
    }),
    updatedBy: text<ListTypeInfo>({
      ...readOnlyField,
      hooks: {
        async resolveInput({ context, operation, resolvedData, item, fieldKey }) {
          // show we have refined types for compatible item.* fields
          if (isTrue(item?.completed ?? false) && resolvedData.completed !== false) return undefined

          // TODO: refined types for the return types
          //   FIXME: CommonFieldConfig need not always be generalised
          return `${context.req?.socket.remoteAddress} (${context.req?.headers['user-agent']})`
        },
      },
    }),
    updatedAt: timestamp<ListTypeInfo>({
      ...readOnlyField,
      hooks: {
        async resolveInput() {
          return new Date()
        },
      },
    }),
  }
}

export const lists = {
  Invoice: list({
    access: allowAll,
    fields: {
      title: text(),
      completed: checkbox(),
      ...trackingFields<Lists.Invoice.TypeInfo>(),
    },
  }),

  Order: list({
    access: allowAll,
    fields: {
      title: text(),
      completed: checkbox(),
      name: text(),
      ...trackingFields<Lists.Order.TypeInfo>(),
    },
  }),

  User: list({
    access: allowAll,
    fields: {
      name: text(),
    },
  }),

  Unused: list({
    access: allowAll,
    fields: {
      completed: checkbox(),
    },
  }),
} satisfies Lists
