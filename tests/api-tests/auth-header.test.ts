import { describe, expect, test } from 'vitest'
import { list } from '@keystone-6/core'
import { text, timestamp, password } from '@keystone-6/core/fields'
import { createAuth, jwtSessions } from '@keystone-6/auth'
import { setupTestRunner, setupTestEnv } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { expectAccessDenied, seed } from './utils.ts'

const initialData = {
  User: [
    { name: 'Boris Bozic', email: 'boris@keystonejs.com', password: 'correctbattery' },
    { name: 'Jed Watson', email: 'jed@keystonejs.com', password: 'horsestaple' },
  ],
}

const sessionSecret = 'api-test-session-secret-at-least-32-characters'

function testOptions() {
  const sessionStrategy = jwtSessions({ secret: sessionSecret })
  const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    passwordField: 'password',
    sessionStrategy,
    getAuthenticatedItemId(context) {
      return context.session?.id
    },
  })

  return {
    config: withAuth({
      async getSession({ context }: { context: any }) {
        const data = await sessionStrategy.get({ context })
        if (!data) return
        return (await context.sudo().db.User.findOne({ where: { id: data.sub } })) ?? undefined
      },
      lists: {
        Post: list({
          access: allowAll,
          fields: {
            title: text(),
            postedAt: timestamp(),
          },
        }),
        User: list({
          access: ({ session }) => !!session,
          fields: {
            name: text(),
            email: text({ isIndexed: 'unique' }),
            password: password(),
          },
        }),
      },
    } as any) as any,
    serve: true,
  }
}

const runner = setupTestRunner(testOptions())

async function login(
  gqlSuper: any,
  email: string,
  password: string
): Promise<{ sessionToken: string; item: { id: any } }> {
  const { body } = await gqlSuper({
    query: `
      mutation($email: String!, $password: String!) {
        authenticateWithPassword(identity: $email, password: $password) {
          ... on AuthenticationWithPasswordSuccess {
            sessionToken
            item { id }
          }
        }
      }
    `,
    variables: { email, password },
  })
  return body.data?.authenticateWithPassword || { sessionToken: '', item: { id: undefined } }
}

describe('Auth testing', () => {
  test(
    'supports auth mutations through withHeaders',
    runner(async ({ context }) => {
      await seed(context, initialData)
      const responseHeaders = new Headers()
      const requestContext = await context.withHeaders(new Headers(), responseHeaders)
      const { data, errors } = await requestContext.graphql.raw({
        query: `
          mutation {
            authenticateWithPassword(
              identity: "${initialData.User[0].email}"
              password: "${initialData.User[0].password}"
            ) {
              ... on AuthenticationWithPasswordSuccess { sessionToken }
            }
          }
        `,
      })
      const sessionToken = (data as any).authenticateWithPassword.sessionToken

      expect(errors).toBeUndefined()
      expect(responseHeaders.get('set-cookie')).toContain(sessionToken)

      const authenticatedContext = await context.withHeaders(
        new Headers({ authorization: `Bearer ${sessionToken}` })
      )
      await expect(authenticatedContext.query.User.findMany()).resolves.toHaveLength(
        initialData.User.length
      )
      await expect(
        authenticatedContext.graphql.run({
          query: `query { authenticatedItem { ... on User { email } } }`,
        })
      ).resolves.toEqual({ authenticatedItem: { email: initialData.User[0].email } })
    })
  )

  test(
    'Gives access denied when not logged in',
    runner(async ({ context }) => {
      await seed(context, initialData)
      const { data, errors } = await context.graphql.raw({ query: '{ users { id } }' })
      expect(data).toEqual({ users: [] })
      expect(errors).toBe(undefined)

      const result = await context.graphql.raw({
        query: `mutation { updateUser(where: { email: "boris@keystonejs.com" }, data: { password: "new_password" }) { id } }`,
      })
      expect(result.data).toEqual({ updateUser: null })
      expectAccessDenied(result.errors, [
        {
          path: ['updateUser'],
          msg: 'You cannot update that User - it may not exist',
        },
      ])
    })
  )

  test('Fails with useful error when identity field is not unique', async () => {
    const sessionStrategy = jwtSessions({ secret: sessionSecret })
    const auth = createAuth({
      listKey: 'User',
      identityField: 'email',
      passwordField: 'password',
      sessionStrategy,
      getAuthenticatedItemId(context) {
        return context.session?.id
      },
    })
    await expect(
      setupTestEnv(
        auth.withAuth({
          async getSession({ context }: { context: any }) {
            const data = await sessionStrategy.get({ context })
            if (!data) return
            return (await context.query.User.findOne({ where: { id: data.sub } })) ?? undefined
          },
          lists: {
            User: list({
              access: allowAll,
              fields: {
                name: text(),
                email: text(),
                password: password(),
              },
            }),
          },
        } as any) as any
      )
    ).rejects.toMatchInlineSnapshot(
      `[Error: createAuth was called with an identityField of email on the list User but that field doesn't allow being searched uniquely with a String or ID. You should likely add \`isIndexed: 'unique'\` to the field at User.email]`
    )
  })

  describe('logged in', () => {
    test(
      'Allows access with bearer token',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)
        const { sessionToken } = await login(
          gqlSuper,
          initialData.User[0].email,
          initialData.User[0].password
        )

        expect(sessionToken).toBeTruthy()
        const { body } = await gqlSuper({ query: '{ users { id } }' }).set(
          'Authorization',
          `Bearer ${sessionToken}`
        )
        const { data, errors } = body
        expect(data).toHaveProperty('users')
        expect(data.users).toHaveLength(initialData.User.length)
        expect(errors).toBe(undefined)
      })
    )

    test(
      'Allows access with cookie',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)
        const { sessionToken } = await login(
          gqlSuper,
          initialData.User[0].email,
          initialData.User[0].password
        )

        expect(sessionToken).toBeTruthy()

        const { body } = await gqlSuper({ query: '{ users { id } }' }).set(
          'Cookie',
          `keystonejs-session=${sessionToken}`
        )
        const { data, errors } = body
        expect(data).toHaveProperty('users')
        expect(data.users).toHaveLength(initialData.User.length)
        expect(errors).toBe(undefined)
      })
    )

    test(
      'Uses the cookie when the authorization header is not a valid Bearer scheme',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)
        const { sessionToken } = await login(
          gqlSuper,
          initialData.User[0].email,
          initialData.User[0].password
        )

        expect(sessionToken).toBeTruthy()

        const { body } = await gqlSuper({ query: '{ users { id } }' })
          .set('Authorization', 'BearerXXX')
          .set('Cookie', `keystonejs-session=${sessionToken}`)
        const { data, errors } = body
        expect(data).toHaveProperty('users')
        expect(data.users).toHaveLength(initialData.User.length)
        expect(errors).toBe(undefined)
      })
    )

    test(
      'Rejects a valid token that is not separated from Bearer by a space',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)
        const { sessionToken } = await login(
          gqlSuper,
          initialData.User[0].email,
          initialData.User[0].password
        )

        expect(sessionToken).toBeTruthy()

        const { body } = await gqlSuper({ query: '{ users { id } }' }).set(
          'Authorization',
          `Bearerx${sessionToken}`
        )
        const { data, errors } = body
        expect(data).toHaveProperty('users')
        expect(data.users).toHaveLength(0) // not a valid Bearer scheme
        expect(errors).toBe(undefined)
      })
    )

    test(
      'Invalid session receives nothing',
      runner(async ({ context, gqlSuper }) => {
        await seed(context, initialData)
        const { body } = await gqlSuper({ query: '{ users { id } }' }).set(
          'Cookie',
          `keystonejs-session=invalidfoo`
        )

        const { data, errors } = body
        expect(data).toHaveProperty('users')
        expect(data.users).toHaveLength(0) // nothing
        expect(errors).toBe(undefined)
      })
    )

    test(
      'Session is dropped if user is removed',
      runner(async ({ context, gqlSuper }) => {
        const { User: users } = await seed(context, initialData)
        const { sessionToken } = await login(
          gqlSuper,
          initialData.User[0].email,
          initialData.User[0].password
        )

        {
          const { body } = await gqlSuper({ query: '{ users { id } }' }).set(
            'Cookie',
            `keystonejs-session=${sessionToken}` // still valid
          )

          const { data, errors } = body
          expect(data).toHaveProperty('users')
          expect(data.users).toHaveLength(2) // something
          expect(errors).toBe(undefined)
        }

        // delete the user we authenticated for
        await gqlSuper({
          query: `mutation ($id: ID!) { deleteUser(where: { id: $id }) { id } }`,
          variables: { id: users[0]?.id },
        }).set('Cookie', `keystonejs-session=${sessionToken}`)

        {
          const { body } = await gqlSuper({ query: '{ users { id } }' }).set(
            'Cookie',
            `keystonejs-session=${sessionToken}` // now invalid
          )

          const { data, errors } = body
          expect(data).toHaveProperty('users')
          expect(data.users).toHaveLength(0) // nothing
          expect(errors).toBe(undefined)
        }
      })
    )
  })
})
