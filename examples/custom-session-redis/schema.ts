import { list } from '@keystone-6/core'
import { allowAll, denyAll, unfiltered } from '@keystone-6/core/access'
import { text, password } from '@keystone-6/core/fields'
import type { Lists, Session } from './generated/keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// needs to be compatible with withAuth
declare module './generated/keystone/types' {
  interface Session {
    sub: string
  }
}

function hasSession({ session }: { session?: Session }) {
  return Boolean(session)
}

function isSameUserFilter({ session }: { session?: Session }) {
  // you need to have a session
  if (!session) return false

  // the authenticated user can only see themselves
  return {
    id: {
      equals: session.sub,
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
        access: {
          read: { item: allowAll, filter: denyAll, order: denyAll },
        },
        graphql: {
          omit: { read: { item: false, filter: true, order: true } },
        },
        isIndexed: 'unique',
        validation: {
          isRequired: true,
        },
      }),

      // the user's password, used for authentication
      password: password({
        validation: {
          isRequired: true,
        },
        // TODO: is anything else required
      }),
    },
  }),
} satisfies Lists
