import { gWithContext, list } from '@keystone-6/core'
import { allowAll, denyAll } from '@keystone-6/core/access'
import { password, text, timestamp } from '@keystone-6/core/fields'
import type { Lists, Context, Session } from '.keystone/types'

import { randomBytes } from 'node:crypto'

const g = gWithContext<Context>()
type g<T> = gWithContext.infer<T>

declare module '.keystone/types' {
  interface Session {
    itemId: string
    listKey: string
  }
}

function hasSession({ session }: { session?: Session }) {
  return Boolean(session)
}

function isSameUserFilter({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false

  // only yourself
  return {
    id: {
      equals: session.itemId,
    },
  }
}

const hiddenField = {
  access: denyAll,
  graphql: {
    omit: true,
  },
  ui: {
    createView: {
      fieldMode: () => 'hidden' as const,
    },
    itemView: {
      fieldMode: () => 'hidden' as const,
    },
    listView: {
      fieldMode: () => 'hidden' as const,
    },
  },
}

export const lists = {
  User: list({
    access: {
      operation: {
        query: allowAll,
        create: allowAll,

        // what a user can update is limited by
        //   the access.filter.* access controls
        update: hasSession,
        delete: hasSession,
      },
      filter: {
        update: isSameUserFilter,
      },
    },
    fields: {
      // the user's name, used as the identity field for authentication
      //   should not be publicly visible
      //
      //   we use isIndexed to enforce names are unique
      //     that may not be suitable for your application
      name: text({
        isIndexed: 'unique',
        validation: {
          isRequired: true,
        },
      }),
      password: password({
        validation: {
          isRequired: true,
        },
      }),
      oneTimeToken: password({ ...hiddenField }),
      oneTimeTokenCreatedAt: timestamp({ ...hiddenField }),
    },
  }),
} satisfies Lists

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage
//
// This example should follow the OWASP guidance for the flow of a password reset, as the outcome is the same (a user is authenticated out of band).
//
// The `requestAuthToken` mutation always returns `true` to prevent user enumeration.
// We ensure that authentication tokens are randomly generated, short-lived (e.g. 5 minutes expiry), and hashed in the database (using the Keystone password field).
// The out of band delivery code and database lookup & update is run asynchronously to reduce timing attacks.
// The delivery of the one-time-token is out of band (e.g. by email or SMS), the exact implementation of ths is left up to you, with console.log used for this example.
//
// The `requestAuthToken` mutation returns `true` only if the token is equal and not passed the expiry.
// The user provided token is hashed as part of the comparison, and an approximately constant-time approach is used to reduce timing attacks.
// We ensure that authentication tokens are randomly generated, short-lived (e.g. 5 minutes expiry), and hashed in the database (using the Keystone password field).
//
// References
//   https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html

export const extendGraphqlSchema = g.extend(base => {
  return {
    mutation: {
      requestAuthToken: g.field({
        type: g.nonNull(g.Boolean), // always true
        args: { userId: g.arg({ type: g.nonNull(g.String) }) },

        async resolve(args, { userId }, context) {
          // run asynchronously to reduce timing attacks
          ;(async function () {
            const ott = randomBytes(16).toString('base64url')
            const sudoContext = context.sudo()

            const user = await sudoContext.db.User.findOne({ where: { id: userId } })
            if (!user) return

            await sudoContext.db.User.updateOne({
              where: { id: userId },
              data: {
                oneTimeToken: ott,
                oneTimeTokenCreatedAt: new Date(),
              },
            })

            // you could send this one time token as is
            //   or embedded in a "magic link" (or similar)
            console.log(`DEBUGGING: the one time token for ${user.id} is ${ott}`)
          })()

          // always return true, lest we leak information
          return true
        },
      }),

      redeemAuthToken: g.field({
        type: g.nonNull(g.Boolean),
        args: {
          userId: g.arg({ type: g.nonNull(g.String) }),
          token: g.arg({ type: g.nonNull(g.String) }),
        },

        async resolve(args, { userId, token }, context) {
          if (!context.sessionStrategy)
            throw new Error('No session implementation available on context')

          const kdf = (base.schema.getType('User') as any).getFields()?.password.extensions
            ?.keystoneSecretField
          const sudoContext = context.sudo()
          const user = await sudoContext.db.User.findOne({ where: { id: userId } })
          const expiry = (user?.oneTimeTokenCreatedAt?.getTime() ?? 0) + 300000 /* 5 minutes */

          if (!user?.oneTimeToken) {
            await kdf.generateHash('simulated-password-to-counter-timing-attack')
            return false
          }

          // TODO: could the expiry be checked before the hashing operation? timing?
          const result = await kdf.compare(token, user.oneTimeToken)
          if (Date.now() > expiry) return false

          if (result) {
            // reset
            await sudoContext.db.User.updateOne({
              where: { id: user.id },
              data: {
                oneTimeToken: null,
                oneTimeTokenCreatedAt: null,
              },
            })

            await context.sessionStrategy.start({
              context,
              data: {
                listKey: 'User',
                itemId: userId,
              },
            })
          }

          return result
        },
      }),
    },
  }
})
