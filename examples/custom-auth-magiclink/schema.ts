import { graphql, list } from '@keystone-6/core'
import { allowAll, unfiltered } from '@keystone-6/core/access'
import { checkbox, password, text, timestamp } from '@keystone-6/core/fields'
import type { Lists, Context } from '.keystone/types'
import { type BaseItem } from '@keystone-6/core/types'
import { randomBytes } from 'node:crypto'
import { assertObjectType } from 'graphql'

export type Session = {
  itemId: string
  data: {
    isAdmin: boolean
  }
}
type SecretFieldImpl = {
  generateHash: (secret: string) => Promise<string>
  compare: (secret: string, hash: string) => Promise<string>
}

function hasSession ({ session }: { session?: Session }) {
  return Boolean(session)
}

function isAdminOrOnlySameUser ({ session }: { session?: Session }) {
  if (!session) return false
  if (session.data.isAdmin) return {} // unfiltered for admins
  return {
    id: { equals: session.itemId },
  }
}

function isAdmin ({ session }: { session?: Session }) {
  // you need to have a session to do this
  if (!session) return false

  // admins can do anything
  if (session.data.isAdmin) return true

  // otherwise, no
  return false
}

export const lists = {
  Post: list({
    access: {
      operation: {
        query: allowAll,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
      filter: {
        // this is redundant as it is the default
        //   but it may help readability
        query: unfiltered,
      },
    },
    fields: {
      title: text(),
      content: text(),
    },
  }),

  User: list({
    access: {
      operation: {
        query: hasSession,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
      filter: {
        query: isAdminOrOnlySameUser,
      },
    },
    fields: {
      name: text(),
      admin: checkbox(),
      magicAuthToken: password({
        access: () => false,
      }),
      magicAuthIssuedAt: timestamp({
        access: () => false,
      }),
      magicAuthRedeemedAt: timestamp({
        access: () => false,
      }),
    },
  }),
} satisfies Lists<Session>

export const extendGraphqlSchema = graphql.extend(base => {
  const errorCodes = ['FAILURE', 'TOKEN_EXPIRED', 'TOKEN_REDEEMED'] as const
  
  const MagicLinkRedemptionErrorCode = graphql.enum({
    name: 'MagicLinkRedemptionErrorCode',
    values: graphql.enumValues(errorCodes),
  })

  const RedeemItemMagicAuthTokenFailure = graphql.object<{
    code:(typeof errorCodes)[number]
    message: string
  }>()({
    name: 'RedeemItemMagicAuthTokenFailure',
    fields: {
      code: graphql.field({ type: graphql.nonNull(MagicLinkRedemptionErrorCode) }),
      message: graphql.field({ type: graphql.nonNull(graphql.String) }),
    },
  })

  const RedeemItemMagicAuthTokenSuccess = graphql.object<{ token: string, item: BaseItem }>()({
    name: 'RedeemItemMagicAuthTokenSuccess',
    fields: {
      token: graphql.field({ type: graphql.nonNull(graphql.String) }),
      item: graphql.field({ type: graphql.nonNull(base.object('User')) }),
    },
  })

  const RedeemItemMagicAuthTokenResult = graphql.union({
    name: 'RedeemItemMagicAuthTokenResult',
    types: [RedeemItemMagicAuthTokenSuccess, RedeemItemMagicAuthTokenFailure],
    resolveType (val) {
      return 'token' in val
        ? 'RedeemItemMagicAuthTokenSuccess'
        : 'RedeemItemMagicAuthTokenFailure'
    },
  })
  return {
    mutation: {
      sendItemMagicAuthLink: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        args: { userId: graphql.arg({ type: graphql.nonNull(graphql.String) }) },
        async resolve (rootVal, { userId }, context: Context) {
          // use sudo to bypass access control
          const sudoContext = context.sudo()
          // Check if the user exists
          const user = await sudoContext.db.User.findOne({ where: { id: userId } })
          if (!user) {
            return false
          }
          // Generate a token
          const token = randomBytes(16).toString('base64url').slice(0, 20)
          // Save the token to the user
          await sudoContext.db.User.updateOne({
            where: { id: userId },
            data: {
              magicAuthToken: token,
              magicAuthIssuedAt: new Date().toISOString(),
              magicAuthRedeemedAt: null,
            },
          })
          // Send the link
          console.log(`Send magic link to ${user.id} with token ${token}`)
          return true
        },
      }),
      redeemItemMagicAuthToken: graphql.field({
        type: graphql.nonNull(RedeemItemMagicAuthTokenResult),
        args: {
          userId: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          token: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },

        async resolve (rootVal, { userId, token }, context: Context) {
          if (!context.sessionStrategy) throw new Error('No session implementation available on context')
          // use sudo to bypass access control
          const sudoContext = context.sudo()
          // Check if the user exists
          const user = await sudoContext.db.User.findOne({ where: { id: userId } })
          
          if (!user || !user.magicAuthToken) {
            return {
              code: 'FAILURE',
              message: 'Fail to find user'
            }
          }
          if (user.magicAuthRedeemedAt) {
            return {
              code: 'TOKEN_REDEEMED',
              message: 'Token already redeemed'
            }
          }
          const secretFieldImpl = assertObjectType(
            base.schema.getType('User'),
          ).getFields()?.password.extensions
            ?.keystoneSecretField as SecretFieldImpl

          await secretFieldImpl.compare(token, user.magicAuthToken)
          // Update system state
          // Save the token and related info back to the item
          await sudoContext.db.User.updateOne({
            where: { id: userId },
            data: { magicAuthRedeemedAt: new Date().toISOString() },
          })

          const sessionToken = (await context.sessionStrategy.start({
            data: {
              listkey: 'User',
              itemId: userId,
            },
            context,
          }))

          // return Failure if sessionStrategy.start() is incompatible
          if (typeof sessionToken !== 'string' || sessionToken.length === 0) {
            return { code: 'FAILURE', message: 'Failed to start session.' }
          }

          return {
            token: sessionToken,
            item: user,
          }
        },
      }),
    },
  }
})
