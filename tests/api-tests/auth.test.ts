import { describe, expect, test } from 'vitest'
import { text, password } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { jwtSessions } from '@keystone-6/auth'
import { createAuth } from '@keystone-6/auth'
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
    const context_ = context.withSession({
      sub: user.id,
      listKey: 'User',
      data: user,
    })
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
