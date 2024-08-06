import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { relationship, text, timestamp } from '@keystone-6/core/fields'
import type { Lists } from '.keystone/types'

export const lists = {
  Post: list({
    access: allowAll,
    fields: {
      description: text({ validation: { isRequired: true } }),
      // omitted by {field}.graphql.omit
      categories: relationship({
        ref: 'Category',
        many: true,
        graphql: {
          omit: true
        }
      }),
      // editable
      groups: relationship({ ref: 'Group', many: true }),
      // omitted by {list}.graphql.omit
      tags: relationship({ ref: 'Tag', many: true }),
      // editable
      reactions: relationship({ ref: 'Reaction', many: true }),
      // semi-editable
      logs: relationship({ ref: 'Log', many: true }),
    },
  }),
  User: list({
    access: allowAll,
    fields: {
      name: text()
    }
  }),

  // empty, no fields
  Category: list({
    access: allowAll,
    fields: {},
  }),

  // empty, no fields
  Group: list({
    access: allowAll,
    fields: {},
  }),

  // empty, no fields, and list is not in the GraphQL schema
  //   for internal usage only
  Tag: list({
    access: allowAll,
    graphql: {
      omit: true
    },
    fields: {},
  }),

  // not empty, fields are not in the GraphQL schema, appears empty
  //   you may see _how many_ reactions, but not by who
  Reaction: list({
    access: allowAll,
    fields: {
      who: relationship({
        ref: 'User',
        // not in the GraphQL schema
        graphql: {
          omit: true
        }
      })
    },
  }),

  // not empty [generally], except no fields for update operations
  Log: list({
    access: allowAll,
    graphql: {
      omit: {
        // update: true, // prefer to omit `update` operations at the list if you can
        //   but that is not always acceptable
        delete: true,
      }
    },
    fields: {
      message: text({
        graphql: {
          // ~somewhat immutable
          omit: {
            update: true,
          }
        }
      }),

      createdAt: timestamp({
        access: {
          read: allowAll,
          create: allowAll,
          update: denyAll,
        },
        graphql: {
          omit: {
            create: true,
            update: true,
          }
        },
      }),
    },
    hooks: {
      resolveInput: {
        create: ({ resolvedData }) => {
          return {
            ...resolvedData,
            createdAt: new Date(),
          }
        },
      }
    }
  }),
} satisfies Lists
