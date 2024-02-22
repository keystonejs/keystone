import { text, timestamp, password } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { statelessSessions } from '@keystone-6/core/session'
import { createAuth } from '@keystone-6/auth'
import { setupTestRunner, setupTestEnv } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { expectAccessDenied, seed } from './utils'

const initialData = {
  User: [
    { name: 'Boris Bozic', email: 'boris@keystonejs.com', password: 'correctbattery' },
    { name: 'Jed Watson', email: 'jed@keystonejs.com', password: 'horsestaple' },
  ],
}

function setup (options?: any) {
  const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    sessionData: 'id',
    ...options,
  })

  return setupTestRunner({
    serve: true,
    config: withAuth({
      db: {} as any,
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
      session: statelessSessions(),
    })
  })
}

async function login (
  gqlSuper: any,
  email: string,
  password: string
): Promise<{ sessionToken: string, item: { id: any } }> {
  const { body } = await gqlSuper({
    query: `
      mutation($email: String!, $password: String!) {
        authenticateUserWithPassword(email: $email, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess {
            sessionToken
            item { id }
          }
        }
      }
    `,
    variables: { email, password },
  })
  return body.data?.authenticateUserWithPassword || { sessionToken: '', item: { id: undefined } }
}

describe('Auth testing', () => {
  test(
    'Gives access denied when not logged in',
    setup()(async ({ context }) => {
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
    const auth = createAuth({
      listKey: 'User',
      identityField: 'email',
      secretField: 'password',
      sessionData: 'id',
    })
    await expect(
      setupTestEnv({
        config: auth.withAuth({
          db: {} as any,
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

          session: statelessSessions(),
        }),
      })
    ).rejects.toMatchInlineSnapshot(
      `[Error: createAuth was called with an identityField of email on the list User but that field doesn't allow being searched uniquely with a String or ID. You should likely add \`isIndexed: 'unique'\` to the field at User.email]`
    )
  })

  describe('logged in', () => {
    test(
      'Allows access with bearer token',
      setup()(async ({ context, gqlSuper }) => {
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
      setup()(async ({ context, gqlSuper }) => {
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
      'Invalid session receives nothing',
      setup()(async ({ context, gqlSuper }) => {
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
      setup()(async ({ context, gqlSuper }) => {
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

    test('Starting up fails if there sessionData configuration has a syntax error', async () => {
      await expect(
        setup({
          sessionData: 'id {',
        })(async () => {})
      ).rejects.toMatchInlineSnapshot(`
              [Error: The query to get session data has a syntax error, the sessionData option in your createAuth usage is likely incorrect
              Syntax Error: Expected Name, found "}".

              GraphQL request:1:51
              1 | query($id: ID!) { user(where: { id: $id }) { id { } }
                |                                                   ^]
            `)
    })

    test('Starting up fails if there sessionData configuration has a validation error', async () => {
      await expect(
        setup({
          sessionData: 'id foo', // foo does not exist
        })(async () => {})
      ).rejects.toMatchInlineSnapshot(`
              [Error: The query to get session data has validation errors, the sessionData option in your createAuth usage is likely incorrect
              Cannot query field "foo" on type "User".

              GraphQL request:1:49
              1 | query($id: ID!) { user(where: { id: $id }) { id foo } }
                |                                                 ^]
            `)
    })
  })
})
