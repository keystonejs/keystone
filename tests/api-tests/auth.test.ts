import { text, password } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'
import { createAuth } from '@keystone-6/auth'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { expectInternalServerError, expectValidationError, seed } from './utils'

const initialData = {
  User: [
    { name: 'Boris Bozic', email: 'boris@keystonejs.com', password: 'correctbattery' },
    { name: 'Jed Watson', email: 'jed@keystonejs.com', password: 'horsestaple' },
    { name: 'Bad User', email: 'bad@keystonejs.com', password: 'incorrectbattery' },
  ],
}

let MAGIC_TOKEN: string

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id name',
  initFirstItem: { fields: ['email', 'password'], itemData: { name: 'First User' } },
  magicAuthLink: {
    sendToken: async ({ identity, token }) => {
      if (identity === 'bad@keystonejs.com') {
        throw new Error('Error in sendToken')
      }
      MAGIC_TOKEN = token
    },
    tokensValidForMins: 60,
  },
  passwordResetLink: {
    sendToken: async ({ identity, token }) => {
      if (identity === 'bad@keystonejs.com') {
        throw new Error('Error in sendToken')
      }
      MAGIC_TOKEN = token
    },
    tokensValidForMins: 60,
  },
})

const runner = setupTestRunner({
  serve: true,
  config: auth.withAuth({
    db: {} as any,
    lists: {
      User: list({
        access: allowAll,
        fields: {
          name: text(),
          email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
          password: password(),
        },
      }),
    },
    session: statelessSessions(),
  }),
})

async function authenticateWithPassword (
  gql: any,
  email: string,
  password: string
) {
  return gql({
    query: `
      mutation($email: String!, $password: String!) {
        authenticateUserWithPassword(email: $email, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess {
            sessionToken
            item { id }
          }
          ... on UserAuthenticationWithPasswordFailure {
            message
          }
        }
      }
    `,
    variables: { email, password },
  })
}

describe('Auth testing', () => {
  describe('authenticateItemWithPassword', () => {
    test(
      'Success - set token in header and return value',
      runner(async ({ context, gqlSuper }) => {
        const { User: users } = await seed(context, initialData)
        const { body, res } = (await authenticateWithPassword(
          gqlSuper,
          'boris@keystonejs.com',
          'correctbattery'
        )) as any

        const sessionHeader = res.rawHeaders
          .find((h: string) => h.startsWith('keystonejs-session'))
          .split(';')[0]
          .split('=')[1]
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          authenticateUserWithPassword: {
            sessionToken: sessionHeader,
            item: { id: users[0].id },
          },
        })
      })
    )

    test(
      'Failure - bad password',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)

        const { body, res } = (await authenticateWithPassword(
          gqlSuper,
          'boris@keystonejs.com',
          'incorrectbattery'
        )) as any

        const sessionHeader = res.rawHeaders.find((h: string) =>
          h.startsWith('keystonejs-session')
        )
        expect(sessionHeader).toBe(undefined)
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          authenticateUserWithPassword: { message: 'Authentication failed.' },
        })
      })
    )

    test(
      'Failure - bad identify value',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)

        const { body, res } = (await authenticateWithPassword(
          gqlSuper,
          'bort@keystonejs.com',
          'correctbattery'
        )) as any

        const sessionHeader = res.rawHeaders.find((h: string) =>
          h.startsWith('keystonejs-session')
        )
        expect(sessionHeader).toBe(undefined)
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          authenticateUserWithPassword: { message: 'Authentication failed.' },
        })
      })
    )
  })
  describe('createInitialItem', () => {
    test(
      'Success - set token in header and return value',
      runner(async ({ gqlSuper }) => {
        const { body, res } = (await gqlSuper({
          query: `
          mutation($email: String!, $password: String!) {
            createInitialUser(data: { email: $email, password: $password }) {
              sessionToken
              item { id name email }
            }
          }
        `,
          variables: { email: 'new@example.com', password: 'new_password' },
        })) as any
        const sessionHeader = res.rawHeaders
          .find((h: string) => h.startsWith('keystonejs-session'))
          .split(';')[0]
          .split('=')[1]
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          createInitialUser: {
            sessionToken: sessionHeader,
            item: { id: expect.any(String), name: 'First User', email: 'new@example.com' },
          },
        })
      })
    )

    test(
      'Failure - items already exist',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)

        const { body, res } = (await gqlSuper({
          query: `
          mutation($email: String!, $password: String!) {
            createInitialUser(data: { email: $email, password: $password }) {
              sessionToken
              item { id name email }
            }
          }
        `,
          variables: { email: 'new@example.com', password: 'new_password' },
        })) as any
        const sessionHeader = res.rawHeaders.find((h: string) =>
          h.startsWith('keystonejs-session')
        )
        expect(sessionHeader).toBe(undefined)
        expectInternalServerError(body.errors, [
          {
            path: ['createInitialUser'],
            message: 'Initial items can only be created when no items exist in that list',
          },
        ])
        expect(body.data).toEqual(null)
      })
    )

    test(
      'Failure - no required field value',
      runner(async ({ gqlSuper }) => {
        const { body, res } = (await gqlSuper({
          query: `
          mutation($password: String!) {
            createInitialUser(data: { password: $password }) {
              sessionToken
              item { id name email }
            }
          }
        `,
          variables: { password: 'new_password' },
        })) as any
        const sessionHeader = res.rawHeaders.find((h: string) =>
          h.startsWith('keystonejs-session')
        )
        expect(sessionHeader).toBe(undefined)
        expectValidationError(body.errors, [
          {
            path: ['createUser'], // I don't like this!
            messages: ['User.email: value must not be empty'],
          },
        ])
        expect(body.data).toEqual(null)
      })
    )
  })

  describe('getMagicAuthLink', () => {
    test(
      'sendItemMagicAuthLink - Success',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!) {
              sendUserMagicAuthLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({ sendUserMagicAuthLink: true })

        // Verify that token fields cant be read.
        let user = await context.query.User.findOne({
          where: { email: 'boris@keystonejs.com' },
          query: 'magicAuthToken { isSet } magicAuthIssuedAt magicAuthRedeemedAt',
        })
        expect(user).toEqual({
          magicAuthToken: null,
          magicAuthIssuedAt: null,
          magicAuthRedeemedAt: null,
        })

        // Verify that token fields have been updated
        user = await context.sudo().query.User.findOne({
          where: { email: 'boris@keystonejs.com' },
          query: 'magicAuthToken { isSet } magicAuthIssuedAt magicAuthRedeemedAt',
        })
        expect(user).toEqual({
          magicAuthToken: { isSet: true },
          magicAuthIssuedAt: expect.any(String),
          magicAuthRedeemedAt: null,
        })
      })
    )
    test(
      'sendItemMagicAuthLink - Failure - missing user',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!) {
              sendUserMagicAuthLink(email: $email)
            }
          `,
          variables: { email: 'bores@keystonejs.com' },
        })
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({ sendUserMagicAuthLink: true })
      })
    )
    test(
      'sendItemMagicAuthLink - Failure - Error in sendToken',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!) {
              sendUserMagicAuthLink(email: $email)
            }
          `,
          variables: { email: 'bad@keystonejs.com' },
        })
        expect(body.data).toEqual(null)
        expectInternalServerError(body.errors, [
          { path: ['sendUserMagicAuthLink'], message: 'Error in sendToken' },
        ])

        // Verify that token fields have been updated
        const user = await context.sudo().query.User.findOne({
          where: { email: 'bad@keystonejs.com' },
          query: 'magicAuthToken { isSet } magicAuthIssuedAt magicAuthRedeemedAt',
        })
        expect(user).toEqual({
          magicAuthToken: { isSet: true },
          magicAuthIssuedAt: expect.any(String),
          magicAuthRedeemedAt: null,
        })
      })
    )

    test(
      'redeemItemMagicAuthToken - Success',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gqlSuper({
          query: `
            mutation($email: String!) {
              sendUserMagicAuthLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!, $token: String!) {
              redeemUserMagicAuthToken(email: $email, token: $token) {
                ... on RedeemUserMagicAuthTokenSuccess {
                  token item { id }
                }
                ... on RedeemUserMagicAuthTokenFailure {
                  code message
                }
              }
            }
          `,
          variables: { email: 'boris@keystonejs.com', token: MAGIC_TOKEN },
        })
        // Veryify we get back a token for the expected user.

        const user = await context.sudo().query.User.findOne({
          where: { email: 'boris@keystonejs.com' },
          query: 'id magicAuthToken { isSet } magicAuthIssuedAt magicAuthRedeemedAt',
        })
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          redeemUserMagicAuthToken: { token: expect.any(String), item: { id: user.id } },
        })
        // Verify that we've set a redemption time
        expect(user).toEqual({
          id: user.id,
          magicAuthToken: { isSet: true },
          magicAuthIssuedAt: expect.any(String),
          magicAuthRedeemedAt: expect.any(String),
        })
      })
    )
    test(
      'redeemItemMagicAuthToken - Failure - bad token',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserMagicAuthLink(email: $email) {
                code message
              }
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!, $token: String!) {
              redeemUserMagicAuthToken(email: $email, token: $token) {
                ... on RedeemUserMagicAuthTokenSuccess {
                  token item { id }
                }
                ... on RedeemUserMagicAuthTokenFailure {
                  code message
                }
              }
            }
          `,
          variables: { email: 'boris@keystonejs.com', token: 'BAD TOKEN' },
        })
        // Generic failure message
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          redeemUserMagicAuthToken: {
            code: 'FAILURE',
            message: 'Auth token redemption failed.',
          },
        })
      })
    )
    test(
      'redeemItemMagicAuthToken - Failure - non-existent user',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserMagicAuthLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!, $token: String!) {
              redeemUserMagicAuthToken(email: $email, token: $token) {
                ... on RedeemUserMagicAuthTokenSuccess {
                  token item { id }
                }
                ... on RedeemUserMagicAuthTokenFailure {
                  code message
                }
              }
            }
          `,
          variables: { email: 'missing@keystonejs.com', token: 'BAD TOKEN' },
        })
        // Generic failure message
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          redeemUserMagicAuthToken: {
            code: 'FAILURE',
            message: 'Auth token redemption failed.',
          },
        })
      })
    )
    test(
      'redeemItemMagicAuthToken - Failure - already redeemed',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserMagicAuthLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        // Redeem once
        await gql({
          query: `
            mutation($email: String!, $token: String!) {
              redeemUserMagicAuthToken(email: $email, token: $token) {
                ... on RedeemUserMagicAuthTokenSuccess {
                  token item { id }
                }
                ... on RedeemUserMagicAuthTokenFailure {
                  code message
                }
              }
            }
          `,
          variables: { email: 'boris@keystonejs.com', token: MAGIC_TOKEN },
        })
        // Redeem twice
        const { body } = await gqlSuper({
          query: `
            mutation($email: String!, $token: String!) {
              redeemUserMagicAuthToken(email: $email, token: $token) {
                ... on RedeemUserMagicAuthTokenSuccess {
                  token item { id }
                }
                ... on RedeemUserMagicAuthTokenFailure {
                  code message
                }
              }
            }
          `,
          variables: { email: 'boris@keystonejs.com', token: MAGIC_TOKEN },
        })
        // Generic failure message
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          redeemUserMagicAuthToken: {
            code: 'TOKEN_REDEEMED',
            message:
              'Auth tokens are single use and the auth token provided has already been redeemed.',
          },
        })
      })
    )
    test(
      'redeemItemMagicAuthToken - Failure - Token expired',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserMagicAuthLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        // Set the "issued at" date to 59 minutes ago
        let user = await context.sudo().query.User.updateOne({
          where: { email: 'boris@keystonejs.com' },
          data: { magicAuthIssuedAt: new Date(Number(new Date()) - 59 * 60 * 1000).toISOString() },
        })
        {
          const { body } = await gqlSuper({
            query: `
              mutation($email: String!, $token: String!) {
                redeemUserMagicAuthToken(email: $email, token: $token) {
                  ... on RedeemUserMagicAuthTokenSuccess {
                    token item { id }
                  }
                  ... on RedeemUserMagicAuthTokenFailure {
                    code message
                  }
                }
              }
            `,
            variables: { email: 'boris@keystonejs.com', token: MAGIC_TOKEN },
          })

          expect(body.errors).toBe(undefined)
          expect(body.data).toEqual({
            redeemUserMagicAuthToken: { token: expect.any(String), item: { id: user.id } },
          })
        }

        // Send another token
        await gql({
          query: `
            mutation($email: String!) {
              sendUserMagicAuthLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        // Set the "issued at" date to 61 minutes ago
        user = await context.sudo().query.User.updateOne({
          where: { email: 'boris@keystonejs.com' },
          data: { magicAuthIssuedAt: new Date(Number(new Date()) - 61 * 60 * 1000).toISOString() },
        })
        {
          const { body } = await gqlSuper({
            query: `
              mutation($email: String!, $token: String!) {
                redeemUserMagicAuthToken(email: $email, token: $token) {
                  ... on RedeemUserMagicAuthTokenSuccess {
                    token item { id }
                  }
                  ... on RedeemUserMagicAuthTokenFailure {
                    code message
                  }
                }
              }
            `,
            variables: { email: 'boris@keystonejs.com', token: MAGIC_TOKEN },
          })

          expect(body.errors).toBe(undefined)
          expect(body.data).toEqual({
            redeemUserMagicAuthToken: {
              code: 'TOKEN_EXPIRED',
              message: 'The auth token provided has expired.',
            },
          })
        }
      })
    )
  })

  describe('getPasswordReset', () => {
    test(
      'sendItemPasswordResetLink - Success',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({ sendUserPasswordResetLink: true })

        // Verify that token fields cant be read.
        let user = await context.query.User.findOne({
          where: { email: 'boris@keystonejs.com' },
          query: 'passwordResetToken { isSet } passwordResetIssuedAt passwordResetRedeemedAt',
        })
        expect(user).toEqual({
          passwordResetToken: null,
          passwordResetIssuedAt: null,
          passwordResetRedeemedAt: null,
        })

        // Verify that token fields have been updated
        user = await context.sudo().query.User.findOne({
          where: { email: 'boris@keystonejs.com' },
          query: 'passwordResetToken { isSet } passwordResetIssuedAt passwordResetRedeemedAt',
        })
        expect(user).toEqual({
          passwordResetToken: { isSet: true },
          passwordResetIssuedAt: expect.any(String),
          passwordResetRedeemedAt: null,
        })
      })
    )

    test(
      'sendItemPasswordResetLink - Failure - missing user',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'bores@keystonejs.com' },
        })
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({ sendUserPasswordResetLink: true })
      })
    )
    test(
      'sendItemPasswordResetLink - Failure - Error in sendToken',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'bad@keystonejs.com' },
        })
        expect(body.data).toEqual(null)
        expectInternalServerError(body.errors, [
          { path: ['sendUserPasswordResetLink'], message: 'Error in sendToken' },
        ])

        // Verify that token fields have been updated
        const user = await context.sudo().query.User.findOne({
          where: { email: 'bad@keystonejs.com' },
          query: 'passwordResetToken { isSet } passwordResetIssuedAt passwordResetRedeemedAt',
        })
        expect(user).toEqual({
          passwordResetToken: { isSet: true },
          passwordResetIssuedAt: expect.any(String),
          passwordResetRedeemedAt: null,
        })
      })
    )

    test(
      'redeemItemPasswordToken - Success',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!, $token: String!, $password: String!) {
              redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
                code message
              }
            }
          `,
          variables: {
            email: 'boris@keystonejs.com',
            token: MAGIC_TOKEN,
            password: 'NEW PASSWORD',
          },
        })
        // Veryify we get back a token for the expected user.

        const user = await context.sudo().query.User.findOne({
          where: { email: 'boris@keystonejs.com' },
          query:
            'id passwordResetToken { isSet } passwordResetIssuedAt passwordResetRedeemedAt password { isSet }',
        })
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({ redeemUserPasswordResetToken: null })
        // Verify that we've set a redemption time and a password hash
        expect(user).toEqual({
          id: user.id,
          passwordResetToken: { isSet: true },
          passwordResetIssuedAt: expect.any(String),
          passwordResetRedeemedAt: expect.any(String),
          password: { isSet: true },
        })
      })
    )
    test(
      'redeemItemPasswordToken - Failure - bad token',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!, $token: String!, $password: String!) {
              redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
                code message
              }
            }
          `,
          variables: {
            email: 'boris@keystonejs.com',
            token: 'BAD TOKEN',
            password: 'NEW PASSWORD',
          },
        })
        // Generic failure message
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          redeemUserPasswordResetToken: {
            code: 'FAILURE',
            message: 'Auth token redemption failed.',
          },
        })
      })
    )
    test(
      'redeemItemPasswordToken - Failure - non-existent user',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })

        const { body } = await gqlSuper({
          query: `
            mutation($email: String!, $token: String!, $password: String!) {
              redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
                code message
              }
            }
          `,
          variables: {
            email: 'missing@keystonejs.com',
            token: 'BAD TOKEN',
            password: 'NEW PASSWORD',
          },
        })
        // Generic failure message
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          redeemUserPasswordResetToken: {
            code: 'FAILURE',
            message: 'Auth token redemption failed.',
          },
        })
      })
    )
    test(
      'redeemItemPasswordToken - Failure - already redeemed',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        // Redeem once
        await gql({
          query: `
            mutation($email: String!, $token: String!, $password: String!) {
              redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
                code message
              }
            }
          `,
          variables: {
            email: 'boris@keystonejs.com',
            token: MAGIC_TOKEN,
            password: 'NEW PASSWORD',
          },
        })
        // Redeem twice
        const { body } = await gqlSuper({
          query: `
            mutation($email: String!, $token: String!, $password: String!) {
              redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
                code message
              }
            }
          `,
          variables: {
            email: 'boris@keystonejs.com',
            token: MAGIC_TOKEN,
            password: 'NEW PASSWORD',
          },
        })
        // Generic failure message
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          redeemUserPasswordResetToken: {
            code: 'TOKEN_REDEEMED',
            message:
              'Auth tokens are single use and the auth token provided has already been redeemed.',
          },
        })
      })
    )
    test(
      'redeemItemPasswordToken - Failure - Token expired',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        // Set the "issued at" date to 59 minutes ago
        await context.sudo().query.User.updateOne({
          where: { email: 'boris@keystonejs.com' },
          data: {
            passwordResetIssuedAt: new Date(Number(new Date()) - 59 * 60 * 1000).toISOString(),
          },
        })
        {
          const { body } = await gqlSuper({
            query: `
              mutation($email: String!, $token: String!, $password: String!) {
                redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
                  code message
                }
              }
            `,
            variables: {
              email: 'boris@keystonejs.com',
              token: MAGIC_TOKEN,
              password: 'NEW PASSWORD',
            },
          })

          expect(body.errors).toBe(undefined)
          expect(body.data).toEqual({ redeemUserPasswordResetToken: null })
        }

        // Send another token
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        // Set the "issued at" date to 61 minutes ago
        await context.sudo().query.User.updateOne({
          where: { email: 'boris@keystonejs.com' },
          data: {
            passwordResetIssuedAt: new Date(Number(new Date()) - 61 * 60 * 1000).toISOString(),
          },
        })
        {
          const { body } = await gqlSuper({
            query: `
              mutation($email: String!, $token: String!, $password: String!) {
                redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
                  code message
                }
              }
            `,
            variables: {
              email: 'boris@keystonejs.com',
              token: MAGIC_TOKEN,
              password: 'NEW PASSWORD',
            },
          })

          expect(body.errors).toBe(undefined)
          expect(body.data).toEqual({
            redeemUserPasswordResetToken: {
              code: 'TOKEN_EXPIRED',
              message: 'The auth token provided has expired.',
            },
          })
        }
      })
    )

    test(
      'validateItemPasswordToken - Success',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })

        const { body } = await gqlSuper({
          query: `
            query($email: String!, $token: String!) {
              validateUserPasswordResetToken(email: $email, token: $token) {
                code message
              }
            }
          `,
          variables: { email: 'boris@keystonejs.com', token: MAGIC_TOKEN },
        })
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({ validateUserPasswordResetToken: null })
      })
    )
    test(
      'validateItemPasswordToken - Failure - bad token',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })

        const { body } = await gqlSuper({
          query: `
            query($email: String!, $token: String!) {
              validateUserPasswordResetToken(email: $email, token: $token) {
                code message
              }
            }
          `,
          variables: { email: 'boris@keystonejs.com', token: 'BAD TOKEN' },
        })
        // Generic failure message
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          validateUserPasswordResetToken: {
            code: 'FAILURE',
            message: 'Auth token redemption failed.',
          },
        })
      })
    )
    test(
      'validateItemPasswordToken - Failure - non-existent user',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })

        const { body } = await gqlSuper({
          query: `
            query($email: String!, $token: String!) {
              validateUserPasswordResetToken(email: $email, token: $token) {
                code message
              }
            }
          `,
          variables: { email: 'missing@keystonejs.com', token: 'BAD TOKEN' },
        })
        // Generic failure message
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          validateUserPasswordResetToken: {
            code: 'FAILURE',
            message: 'Auth token redemption failed.',
          },
        })
      })
    )
    test(
      'validateItemPasswordToken - Failure - already redeemed',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        // Redeem once
        await gql({
          query: `
            mutation($email: String!, $token: String!, $password: String!) {
              redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
                code message
              }
            }
          `,
          variables: {
            email: 'boris@keystonejs.com',
            token: MAGIC_TOKEN,
            password: 'NEW PASSWORD',
          },
        })
        // Redeem twice
        const { body } = await gqlSuper({
          query: `
            query($email: String!, $token: String!) {
              validateUserPasswordResetToken(email: $email, token: $token) {
                code message
              }
            }
          `,
          variables: { email: 'boris@keystonejs.com', token: MAGIC_TOKEN },
        })
        // Generic failure message
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          validateUserPasswordResetToken: {
            code: 'TOKEN_REDEEMED',
            message:
              'Auth tokens are single use and the auth token provided has already been redeemed.',
          },
        })
      })
    )
    test(
      'validateItemPasswordToken - Failure - Token expired',
      runner(async ({ context, gql, gqlSuper }) => {
        await seed(context, initialData)
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        // Set the "issued at" date to 59 minutes ago
        await context.sudo().query.User.updateOne({
          where: { email: 'boris@keystonejs.com' },
          data: {
            passwordResetIssuedAt: new Date(Number(new Date()) - 59 * 60 * 1000).toISOString(),
          },
        })
        {
          const { body } = await gqlSuper({
            query: `
              query($email: String!, $token: String!) {
                validateUserPasswordResetToken(email: $email, token: $token) {
                  code message
                }
              }
            `,
            variables: { email: 'boris@keystonejs.com', token: MAGIC_TOKEN },
          })

          expect(body.errors).toBe(undefined)
          expect(body.data).toEqual({ validateUserPasswordResetToken: null })
        }

        // Send another token
        await gql({
          query: `
            mutation($email: String!) {
              sendUserPasswordResetLink(email: $email)
            }
          `,
          variables: { email: 'boris@keystonejs.com' },
        })
        // Set the "issued at" date to 61 minutes ago
        await context.sudo().query.User.updateOne({
          where: { email: 'boris@keystonejs.com' },
          data: {
            passwordResetIssuedAt: new Date(Number(new Date()) - 61 * 60 * 1000).toISOString(),
          },
        })
        {
          const { body } = await gqlSuper({
            query: `
              query($email: String!, $token: String!) {
                validateUserPasswordResetToken(email: $email, token: $token) {
                  code message
                }
              }
            `,
            variables: { email: 'boris@keystonejs.com', token: MAGIC_TOKEN },
          })

          expect(body.errors).toBe(undefined)
          expect(body.data).toEqual({
            validateUserPasswordResetToken: {
              code: 'TOKEN_EXPIRED',
              message: 'The auth token provided has expired.',
            },
          })
        }
      })
    )
  })
})
