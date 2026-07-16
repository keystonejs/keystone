import { list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { text, checkbox, timestamp } from '@keystone-6/core/fields'
import { password } from './api-key-field'
import type { Lists } from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

export type Session = {
  itemId: string
  data: {
    isAdmin: boolean
  }
}

function hasSession({ session }: { session?: Session }) {
  return Boolean(session)
}

function isAdminOrSameUser({ session, item }: { session?: Session; item: Lists.User.Item | null }) {
  // you need to have a session to do this
  if (!session) return false

  // admins can do anything
  if (session.data.isAdmin) return true

  // no item? then no
  if (!item) return false

  // the authenticated user needs to be equal to the user we are updating
  return session.itemId === item.id
}

function isAdminOrSameUserFilter({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false

  // admins can see everything
  if (session.data?.isAdmin) return {}

  // only yourself
  return {
    id: {
      equals: session.itemId,
    },
  }
}

function isAdmin({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false

  // admins can do anything
  if (session.data.isAdmin) return true

  // otherwise, no
  return false
}

function isAdminOrSameUserCreate({ session, inputData }: { session?: Session; inputData: any }) {
  if (!session) return false
  if (session.data.isAdmin) return true
  return inputData.id === session.itemId
}

export const lists = {
  User: list({
    access: {
      operation: {
        create: allowAll,
        query: hasSession,

        // what a user can update is limited by
        //   the access.filter.* and access.item.* access controls
        update: hasSession,

        // only admins can delete users
        delete: isAdmin,
      },
      filter: {
        query: isAdminOrSameUserFilter,
        update: isAdminOrSameUserFilter,
      },
      item: {
        // this is redundant as ^filter.update should stop unauthorised updates
        //   we include it anyway as a demonstration
        update: isAdminOrSameUser,
      },
    },
    ui: {
      // only show deletion options for admins
      hideDelete: args => !isAdmin(args),
      listView: {
        // the default columns that will be displayed in the list view
        initialColumns: ['name', 'isAdmin'],
      },
    },
    fields: {
      // the user's name, used as the identity field for authentication
      //   should not be publicly visible
      //
      //   we use isIndexed to enforce names are unique
      //     that may not be suitable for your application
      name: text({
        access: {
          // only the respective user, or an admin can read this field
          read: isAdminOrSameUser,

          // only admins can update this field
          update: isAdmin,
        },
        isFilterable: false,
        isOrderable: false,
        isIndexed: 'unique',
        validation: {
          isRequired: true,
        },
      }),

      // the user's password, used as the secret field for authentication
      //   should not be publicly visible
      password: password({
        access: {
          read: denyAll,
          update: isAdminOrSameUser,
        },
        validation: {
          isRequired: true,
        },
        ui: {
          itemView: {
            // don't show this field if it isn't relevant
            fieldMode: args => (isAdminOrSameUser(args) ? 'edit' : 'hidden'),
          },
          listView: {
            fieldMode: 'hidden',
          },
        },
      }),

      // the API key secret is hashed by the password field before it is stored
      apiKey: password({
        access: {
          read: isAdminOrSameUser,
          create: isAdminOrSameUserCreate,
          update: isAdminOrSameUser,
        },
        graphql: {
          omit: {
            create: true,
          },
        },
        isFilterable: false,
        validation: {
          length: {
            min: 32,
          },
        },
        ui: {
          description:
            'Use as the secret in the Keystone-Example-API-Key-Secret header, with the user id in Keystone-Example-API-Key-ID.',
          itemView: {
            fieldMode: args => (isAdminOrSameUser(args) ? 'edit' : 'hidden'),
          },
          listView: {
            fieldMode: 'hidden',
          },
        },
      }),

      apiKeyExpiresAt: timestamp({
        access: {
          read: isAdminOrSameUser,
          create: isAdmin,
          update: isAdmin,
        },
        graphql: {
          omit: {
            create: true,
          },
        },
        isFilterable: false,
        isOrderable: false,
        ui: {
          itemView: {
            fieldMode: args => (isAdminOrSameUser(args) ? 'edit' : 'hidden'),
          },
        },
      }),

      // a flag to indicate if this user is an admin
      //  should not be publicly visible
      isAdmin: checkbox({
        access: {
          // only the respective user, or an admin can read this field
          read: isAdminOrSameUser,

          // only admins can create, or update this field
          create: isAdmin,
          update: isAdmin,
        },
        defaultValue: false,
        graphql: {
          omit: {
            create: true,
          },
        },
        isFilterable: false,
        isOrderable: false,
        ui: {
          // only admins can edit this field
          createView: {
            fieldMode: args => (isAdmin(args) ? 'edit' : 'hidden'),
          },
          itemView: {
            fieldMode: args => (isAdmin(args) ? 'edit' : 'read'),
          },
        },
      }),
    },
  }),
} satisfies Lists<Session>
