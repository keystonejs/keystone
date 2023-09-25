import { list } from '@keystone-6/core';
//  import type { BaseListTypeInfo } from '@keystone-6/core/types';
import type { FieldHooks } from '@keystone-6/core/types';
import { allowAll, denyAll } from '@keystone-6/core/access';
import { checkbox, text, timestamp } from '@keystone-6/core/fields';
import type { Lists, TypeInfo } from '.keystone/types';

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
      fieldMode: (args: unknown) => 'hidden' as const,
    },
    itemView: {
      fieldMode: (args: unknown) => 'read' as const,
    },
    listView: {
      fieldMode: (args: unknown) => 'read' as const,
    },
  },
};

// we use this function to show that completed is a boolean type
//   which would be missing if the types were unrefined
//   a common problem when re-using code
function isTrue (b: boolean) {
  return b === true
}

type ListsT = TypeInfo['lists'];
type FindListsWithField <K> = {
  [key in keyof ListsT]: K extends ListsT[key]['fields']
    ? ListsT[key]
    : never
}[keyof ListsT]

// alternatively, if you don't like type functions
//  type CompatibleLists = Lists.Invoice.TypeInfo | Lists.Order.TypeInfo
type CompatibleLists = FindListsWithField<'completed'>
//  type CompatibleLists = TypeInfo['lists'][keyof TypeInfo['lists']] // item is resolved, but not completed
//  type CompatibleLists = BaseListTypeInfo // nothing is refined, item is Record<string, unknown>

function trackingByHooks <
  ListTypeInfo extends CompatibleLists,
//    FieldKey extends 'createdBy' | 'updatedBy' // TODO
> (): FieldHooks<ListTypeInfo> {
  return {
    async resolveInput ({ context, operation, resolvedData, item, fieldKey }) {
      if (operation === 'update') {
        if (isTrue(item.completed)) return undefined
      }

      // TODO: refined types for the return types
      //   TODO: CommonFieldConfig shouldn't always be generalised across the entire List
      return `${context.req?.socket.remoteAddress} (${context.req?.headers['user-agent']})` as any;
    }
  }
}

function trackingFields <ListTypeInfo extends CompatibleLists> () {
  return {
    createdBy: text<ListTypeInfo>({
      ...readOnly,
      hooks: {
        ...trackingByHooks<ListTypeInfo>(),
      }
    }),
    createdAt: timestamp<ListTypeInfo>({
      ...readOnly,
    }),
    updatedBy: text<ListTypeInfo>({
      ...readOnly,
      hooks: {
        ...trackingByHooks<ListTypeInfo>(),
      }
    }),
    updatedAt: timestamp<ListTypeInfo>({
      ...readOnly,
    }),
  }
}

export const lists: Lists = {
  Invoice: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      completed: checkbox(),
      ...trackingFields()
    },
  }),

  Order: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      completed: checkbox(),
      ...trackingFields()
    },
  }),

  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } })
    },
  }),
};
