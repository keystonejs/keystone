import { describe, expect, test } from 'vitest'
import { text } from '@keystone-6/core/fields'
import { createAuth, jwtSessions, password } from '@keystone-6/auth'
import { g, list } from '@keystone-6/core'
import type { BaseItem } from '@keystone-6/core/types'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { seed } from './utils.ts'

const initialData = {
  User: [
    { name: 'Boris Bozic', email: 'boris@keystonejs.com', password: 'correctbattery' },
    { name: 'Jed Watson', email: 'jed@keystonejs.com', password: 'horsestaple' },
    { name: 'Bad User', email: 'bad@keystonejs.com', password: 'incorrectbattery' },
  ],
}

const sessionStrategy = jwtSessions({
  secret: 'api-test-session-secret-at-least-32-characters',
})

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy,
  getAuthenticatedItemId(context) {
    return context.session?.sub
  },
})

const extendLegacyPasswordSchema = g.extend(base => {
  const authenticate = base.schema.getMutationType()?.getFields().authenticateWithPassword?.resolve
  if (!authenticate) throw new Error('The Keystone password authentication mutation is missing')

  const success = g.object<{ sessionToken: string; item: BaseItem }>()({
    name: 'UserAuthenticationWithPasswordSuccess',
    fields: {
      sessionToken: g.field({ type: g.nonNull(g.String) }),
      item: g.field({ type: g.nonNull(base.object('Person')) }),
    },
  })
  const failure = g.object<{ message: string }>()({
    name: 'UserAuthenticationWithPasswordFailure',
    fields: {
      message: g.field({ type: g.nonNull(g.String) }),
    },
  })
  const result = g.union({
    name: 'UserAuthenticationWithPasswordResult',
    types: [success, failure],
    resolveType(value) {
      return 'sessionToken' in value
        ? 'UserAuthenticationWithPasswordSuccess'
        : 'UserAuthenticationWithPasswordFailure'
    },
  })

  return {
    mutation: {
      authenticateUserWithPassword: g.field({
        type: result,
        deprecationReason: 'Use authenticateWithPassword',
        args: {
          email: g.arg({ type: g.nonNull(g.String) }),
          password: g.arg({ type: g.nonNull(g.String) }),
        },
        async resolve(source, { email, password }, context, info) {
          return (await authenticate(source, { identity: email, password }, context, info)) as g<
            typeof result
          >
        },
      }),
    },
  }
})

const runner = setupTestRunner({
  serve: true,
  config: {
    lists: {
      User: list({
        access: allowAll,
        graphql: {
          singular: 'Person',
          plural: 'People',
        },
        fields: {
          name: text(),
          email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
          password: password(),
          noRead: text({ access: { read: () => false } }),
          yesRead: text({ access: { read: () => true } }),
        },
      }),
    },
    getSession: sessionStrategy.get,
    graphql: { extendGraphqlSchema: extendLegacyPasswordSchema },
  },
  wrap: config => auth.withAuth(config),
})

async function authenticateWithPassword(gql: any, email: string, password: string) {
  return gql({
    query: `
      mutation($email: String!, $password: String!) {
        authenticateWithPassword(identity: $email, password: $password) {
          ... on AuthenticationWithPasswordSuccess {
            sessionToken
            item { id }
          }
          ... on AuthenticationWithPasswordFailure {
            message
          }
        }
      }
    `,
    variables: { email, password },
  })
}

describe('Auth testing', () => {
  test('withAuth requires getSession to be configured', async () => {
    const invalidRunner = setupTestRunner({
      config: {
        lists: {
          User: list({
            access: allowAll,
            fields: {
              email: text(),
              password: password(),
            },
          }),
        },
      },
      wrap: config => auth.withAuth(config),
    })

    await expect(invalidRunner(async () => {})()).rejects.toThrow(
      'getSession must be configured in your Keystone config to use withAuth'
    )
  })

  describe('authenticateWithPassword', () => {
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
          authenticateWithPassword: {
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

        const sessionHeader = res.rawHeaders.find((h: string) => h.startsWith('keystonejs-session'))
        expect(sessionHeader).toBe(undefined)
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          authenticateWithPassword: { message: 'Authentication failed.' },
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

        const sessionHeader = res.rawHeaders.find((h: string) => h.startsWith('keystonejs-session'))
        expect(sessionHeader).toBe(undefined)
        expect(body.errors).toBe(undefined)
        expect(body.data).toEqual({
          authenticateWithPassword: { message: 'Authentication failed.' },
        })
      })
    )
  })

  test(
    'authenticateUserWithPassword delegates to authenticateWithPassword',
    runner(async ({ context, gqlSuper }) => {
      const { User: users } = await seed(context, initialData)
      const email = 'boris@keystonejs.com'
      const query = `
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
      `

      const success = await gqlSuper({ query, variables: { email, password: 'correctbattery' } })
      expect(success.body.errors).toBeUndefined()
      expect(success.body.data).toEqual({
        authenticateUserWithPassword: {
          sessionToken: expect.any(String),
          item: { id: users[0].id },
        },
      })
      const { sessionToken } = success.body.data.authenticateUserWithPassword
      const sessionCookie = success
        .get('Set-Cookie')
        ?.find(cookie => cookie.startsWith('keystonejs-session='))
      expect(sessionCookie?.split(';')[0]).toBe(`keystonejs-session=${sessionToken}`)

      const failure = await gqlSuper({ query, variables: { email, password: 'incorrectbattery' } })
      expect(failure.body.errors).toBeUndefined()
      expect(failure.body.data).toEqual({
        authenticateUserWithPassword: { message: 'Authentication failed.' },
      })
      expect(failure.get('Set-Cookie') ?? []).not.toContainEqual(
        expect.stringMatching(/^keystonejs-session=/)
      )
    })
  )
})

test(
  'authenticatedItem',
  runner(async ({ context }) => {
    const user = await context.db.User.createOne({
      data: {
        name: 'test',
        email: 'test@',
        yesRead: 'yes',
        noRead: 'no',
      },
    })

    const query = `query { authenticatedItem { ... on Person { id yesRead noRead } } }`
    const context_ = context.withSession({ sub: user.id })
    const { data, errors } = await context_.graphql.raw({ query })
    expect(data).toEqual({
      authenticatedItem: {
        id: user.id,
        yesRead: user.yesRead,
        noRead: null,
      },
    })
    expect(errors).toBe(undefined)
  })
)
