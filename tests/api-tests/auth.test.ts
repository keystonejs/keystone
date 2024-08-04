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

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id name',
  initFirstItem: { fields: ['email', 'password'], itemData: { name: 'First User' } },
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
            message: 'Unexpected error value: \"Authentication failed.\"',
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
})
