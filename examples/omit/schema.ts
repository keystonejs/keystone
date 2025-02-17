import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, relationship } from '@keystone-6/core/fields'

import { type Lists } from '.keystone/types'

export const lists = {
  Person: list({
    access: allowAll,
    fields: {
      // the person's name, publicly visible
      name: text({ validation: { isRequired: true } }),
      // since create is omitted on the Priority list, the nested create doesn't exist for this field in the public GraphQL schema
      priority: relationship({ ref: 'Priority.person', many: true }),
      // since the Nice list is completely omitted, this field doesn't exist in the public GraphQL schema
      nice: relationship({ ref: 'Nice.person', many: true }),
    },
  }),
  Priority: list({
    access: allowAll,
    fields: {
      person: relationship({ ref: 'Person.priority' }),
    },

    // this list is partially omitted -> it will partially be in the public GraphQL schema
    graphql: {
      omit: {
        // query: false, // default allowed
        create: true,
        update: true,
      },
    },
  }),
  Nice: list({
    access: allowAll,
    fields: {
      person: relationship({ ref: 'Person.nice' }),
    },

    // this list is completely omitted -> it won't be in the public GraphQL schema
    graphql: {
      omit: true,
    },
  }),
  Naughty: list({
    access: allowAll,
    fields: {
      person: relationship({
        ref: 'Person',

        // this field is omitted at the field level
        //   the public GraphQL schema will have a Naughty type, but it will only have an `id` field
        graphql: {
          omit: true,
        },
      }),

      reason: text({
        // this field is omitted at the field level for update operations
        //   the public GraphQL schema will have a Naughty type, but no update type
        graphql: {
          omit: {
            update: true,
          },
        },
      }),

      hiddenReason: text({
        // this field is omitted at the field level for update operations
        //   the public GraphQL schema will have a Naughty type, but no read or update type
        graphql: {
          omit: {
            read: true,
            update: true,
          },
        },
      }),
    },
  }),
} satisfies Lists
