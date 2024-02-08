import { list } from '@keystone-6/core'
import { denyAll, unfiltered } from '@keystone-6/core/access'
import { text, password, timestamp } from '@keystone-6/core/fields'
import type { Lists } from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// needs to be compatible with withAuth
export type Session = {
  listKey: string
  itemId: string
  data: {
    passwordChangedAt: string
  }
  startedAt: number
}

function hasSession ({ session }: { session?: Session }) {
  return Boolean(session)
}

function isSameUserFilter ({ session }: { session?: Session }) {
  // you need to have a session
  if (!session) return false

  // the authenticated user can only see themselves
  return {
    id: {
      equals: session.itemId,
    },
  }
}

export const lists = {
  User: list({
    access: {
      operation: hasSession,
      filter: {
        query: unfiltered,
        update: isSameUserFilter,
        delete: isSameUserFilter,
      },
    },
    fields: {
      // the user's name, used as the identity field for authentication
      name: text({
        isFilterable: false,
        isOrderable: false,
        isIndexed: 'unique',
        validation: {
          isRequired: true,
        },
      }),

      // the user's password, used as the secret field for authentication
      password: password({
        validation: {
          isRequired: true,
        },
        // TODO: is anything else required
      }),

      // a passwordChangedAt field, invalidates a session if changed
      passwordChangedAt: timestamp({
        access: denyAll,
        isFilterable: false,
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'hidden' },
          listView: { fieldMode: 'hidden' },
        },
      }),
    },
    hooks: {
      resolveInput: {
        update: ({ resolvedData }) => {
          if ('password' in resolvedData) {
            resolvedData.passwordChangedAt = new Date()
          }

          return resolvedData
        },
      },
    },
  }),
} satisfies Lists<Session>
