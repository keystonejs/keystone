import { list } from '@keystone-6/core'
//  import type { BaseListTypeInfo } from '@keystone-6/core/types';
import type { FieldHooks } from '@keystone-6/core/types'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { checkbox, text, timestamp } from '@keystone-6/core/fields'

import type { Lists, TypeInfo } from '.keystone/types'

const readOnly = {
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
function isTrue (b: boolean) {
  return b === true
}

type ListsT = TypeInfo['lists']
type FindListsWithField<K> = {
  [key in keyof ListsT]: K extends ListsT[key]['fields'] ? ListsT[key] : never;
}[keyof ListsT]

// alternatively, if you don't like type functions
//  type CompatibleLists = Lists.Invoice.TypeInfo | Lists.Order.TypeInfo
type CompatibleLists = FindListsWithField<'completed'>
//  type CompatibleLists = TypeInfo['lists'][keyof TypeInfo['lists']] // item is resolved, but not completed
//  type CompatibleLists = BaseListTypeInfo // nothing is refined, item is Record<string, unknown>

function trackingByHooks<
  ListTypeInfo extends CompatibleLists
  //    FieldKey extends 'createdBy' | 'updatedBy' // TODO: refined types for the return types
> (immutable: boolean = false): FieldHooks<ListTypeInfo> {
  return {
    async resolveInput ({ context, operation, resolvedData, item, fieldKey }) {
      if (operation === 'update') {
        if (immutable) return undefined

        // show we have refined types for compatible item.* fields
        if (isTrue(item.completed) && resolvedData.completed !== false) return undefined
      }

      // TODO: refined types for the return types
      //   FIXME: CommonFieldConfig need not always be generalised
      return `${context.req?.socket.remoteAddress} (${context.req?.headers['user-agent']})` as any
    },
  }
}

function trackingAtHooks<
  ListTypeInfo extends CompatibleLists
  //    FieldKey extends 'createdAt' | 'updatedAt' // TODO: refined types for the return types
> (immutable: boolean = false): FieldHooks<ListTypeInfo> {
  return {
    // TODO: switch to operation routing when supported for fields
    async resolveInput ({ context, operation, resolvedData, item, fieldKey }) {
      if (operation === 'update') {
        if (immutable) return undefined

        // show we have refined types for compatible item.* fields
        if (isTrue(item.completed) && resolvedData.completed !== false) return undefined
      }

      // TODO: refined types for the return types
      //   FIXME: CommonFieldConfig need not always be generalised
      return new Date() as any
    },
  }
}

function trackingFields<ListTypeInfo extends CompatibleLists> () {
  return {
    createdBy: text<ListTypeInfo>({
      ...readOnly,
      hooks: {
        ...trackingByHooks<ListTypeInfo>(true),
      },
    }),
    createdAt: timestamp<ListTypeInfo>({
      ...readOnly,
      hooks: {
        ...trackingAtHooks<ListTypeInfo>(true),
      },
    }),
    updatedBy: text<ListTypeInfo>({
      ...readOnly,
      hooks: {
        ...trackingByHooks<ListTypeInfo>(),
      },
    }),
    updatedAt: timestamp<ListTypeInfo>({
      ...readOnly,
      hooks: {
        ...trackingAtHooks<ListTypeInfo>(),
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
      ...trackingFields(),
    },
  }),

  Order: list({
    access: allowAll,
    fields: {
      title: text(),
      completed: checkbox(),
      ...trackingFields(),
    },
  }),

  User: list({
    access: allowAll,
    fields: {
      name: text(),
    },
  }),
} satisfies Lists
