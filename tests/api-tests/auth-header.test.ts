import { text, timestamp, password } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { statelessSessions } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import type { KeystoneContext, KeystoneConfig } from '@keystone-next/types';
import { setupTestRunner, TestArgs } from '@keystone-next/testing';
import { apiTestConfig, expectAccessDenied } from './utils';

const initialData = {
  User: [
    {
      data: {
        name: 'Boris Bozic',
        email: 'boris@keystone.com',
        password: 'correctbattery',
      },
    },
    {
      data: {
        name: 'Jed Watson',
        email: 'jed@keystone.com',
        password: 'horsestaple',
      },
    },
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
  config: apiTestConfig(
    auth.withAuth({
      lists: createSchema({
        Post: list({
          fields: {
            title: text(),
            postedAt: timestamp(),
          },
        }),
        User: list({
          fields: {
            name: text(),
            email: text(),
            password: password(),
          },
          access: {
            create: defaultAccess,
            read: defaultAccess,
            update: defaultAccess,
            delete: defaultAccess,
          },
        }),
      }),
      session: statelessSessions({ secret: COOKIE_SECRET }),
    } as KeystoneConfig)
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
      const { data, errors } = await context.graphql.raw({ query: '{ allUsers { id } }' });
      expect(data).toEqual({ allUsers: null });
      expectAccessDenied(errors, [{ path: ['allUsers'] }]);
    })
  );

  describe('logged in', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip(
      'Allows access with bearer token',
      runner(async ({ context, graphQLRequest }) => {
        for (const [listKey, data] of Object.entries(initialData)) {
          await context.sudo().lists[listKey].createMany({ data });
        }
        const { sessionToken } = await login(
          graphQLRequest,
          initialData.User[0].data.email,
          initialData.User[0].data.password
        );

        expect(sessionToken).toBeTruthy();
        const { body } = await graphQLRequest({ query: '{ allUsers { id } }' }).set(
          'Authorization',
          `Bearer ${sessionToken}`
        );
        const { data, errors } = body;
        expect(data).toHaveProperty('allUsers');
        expect(data.allUsers).toHaveLength(initialData.User.length);
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
          initialData.User[0].data.email,
          initialData.User[0].data.password
        );

        expect(sessionToken).toBeTruthy();

        const { body } = await graphQLRequest({ query: '{ allUsers { id } }' }).set(
          'Cookie',
          `keystonejs-session=${sessionToken}`
        );
        const { data, errors } = body;
        expect(data).toHaveProperty('allUsers');
        expect(data.allUsers).toHaveLength(initialData.User.length);
        expect(errors).toBe(undefined);
      })
    );
  });
});
