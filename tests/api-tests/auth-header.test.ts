import { text, timestamp, password } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { statelessSessions } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import type { KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestRunner, TestArgs, setupTestEnv } from '@keystone-next/keystone/testing';
import { apiTestConfig, expectAccessDenied } from './utils';

const initialData = {
  User: [
    { name: 'Boris Bozic', email: 'boris@keystone.com', password: 'correctbattery' },
    { name: 'Jed Watson', email: 'jed@keystone.com', password: 'horsestaple' },
  ],
};

const COOKIE_SECRET = 'qwertyuiopasdfghjlkzxcvbmnm1234567890';
const defaultAccess = ({ context }: { context: KeystoneContext }) => !!context.session?.data;

const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id',
});

const runner = setupTestRunner({
  config: auth.withAuth(
    apiTestConfig({
      lists: {
        Post: list({
          fields: {
            title: text(),
            postedAt: timestamp(),
          },
        }),
        User: list({
          fields: {
            name: text(),
            email: text({ isIndexed: 'unique', isFilterable: true }),
            password: password(),
          },
          access: {
            operation: {
              create: defaultAccess,
              query: defaultAccess,
              update: defaultAccess,
              delete: defaultAccess,
            },
          },
        }),
      },
      session: statelessSessions({ secret: COOKIE_SECRET }),
    })
  ),
});

async function login(
  graphQLRequest: TestArgs['graphQLRequest'],
  email: string,
  password: string
): Promise<{ sessionToken: string; item: { id: any } }> {
  const { body } = await graphQLRequest({
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
  });
  return body.data?.authenticateUserWithPassword || { sessionToken: '', item: { id: undefined } };
}

describe('Auth testing', () => {
  test(
    'Gives access denied when not logged in',
    runner(async ({ context }) => {
      // seed the db
      for (const [listKey, data] of Object.entries(initialData)) {
        await context.sudo().lists[listKey].createMany({ data });
      }
      const { data, errors } = await context.graphql.raw({ query: '{ users { id } }' });
      expect(data).toEqual({ users: [] });
      expect(errors).toBe(undefined);

      const result = await context.graphql.raw({
        query: `mutation { updateUser(where: { email: "boris@keystone.com" }, data: { password: "new_password" }) { id } }`,
      });
      expect(result.data).toEqual({ updateUser: null });
      expectAccessDenied(result.errors, [
        {
          path: ['updateUser'],
          msg: "You cannot perform the 'update' operation on the list 'User'.",
        },
      ]);
    })
  );

  test('Fails with useful error when identity field is not unique', async () => {
    const auth = createAuth({
      listKey: 'User',
      identityField: 'email',
      secretField: 'password',
      sessionData: 'id',
    });
    await expect(
      setupTestEnv({
        config: auth.withAuth(
          apiTestConfig({
            lists: {
              User: list({
                fields: {
                  name: text(),
                  email: text(),
                  password: password(),
                },
              }),
            },

            session: statelessSessions({ secret: COOKIE_SECRET }),
          })
        ),
      })
    ).rejects.toMatchInlineSnapshot(
      `[Error: createAuth was called with an identityField of email on the list User but that field doesn't allow being searched uniquely with a String or ID. You should likely add \`isIndexed: 'unique', isFilterable: true\` to the field at User.email]`
    );
  });

  describe('logged in', () => {
    test(
      'Allows access with bearer token',
      runner(async ({ context, graphQLRequest }) => {
        for (const [listKey, data] of Object.entries(initialData)) {
          await context.sudo().lists[listKey].createMany({ data });
        }
        const { sessionToken } = await login(
          graphQLRequest,
          initialData.User[0].email,
          initialData.User[0].password
        );

        expect(sessionToken).toBeTruthy();
        const { body } = await graphQLRequest({ query: '{ users { id } }' }).set(
          'Authorization',
          `Bearer ${sessionToken}`
        );
        const { data, errors } = body;
        expect(data).toHaveProperty('users');
        expect(data.users).toHaveLength(initialData.User.length);
        expect(errors).toBe(undefined);
      })
    );

    test(
      'Allows access with cookie',
      runner(async ({ context, graphQLRequest }) => {
        for (const [listKey, data] of Object.entries(initialData)) {
          await context.sudo().lists[listKey].createMany({ data });
        }
        const { sessionToken } = await login(
          graphQLRequest,
          initialData.User[0].email,
          initialData.User[0].password
        );

        expect(sessionToken).toBeTruthy();

        const { body } = await graphQLRequest({ query: '{ users { id } }' }).set(
          'Cookie',
          `keystonejs-session=${sessionToken}`
        );
        const { data, errors } = body;
        expect(data).toHaveProperty('users');
        expect(data.users).toHaveLength(initialData.User.length);
        expect(errors).toBe(undefined);
      })
    );
  });
});
