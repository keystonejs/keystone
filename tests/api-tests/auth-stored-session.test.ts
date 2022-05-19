import { text, timestamp, password, checkbox } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { storedSessions } from '@keystone-6/core/session';
import { redisSessionStore } from '@keystone-6/session-store-redis';

import { createClient } from '@redis/client';
import { createAuth } from '@keystone-6/auth';
import type { KeystoneContext } from '@keystone-6/core/types';
import { setupTestRunner, TestArgs } from '@keystone-6/core/testing';
import { apiTestConfig, expectAccessDenied, seed } from './utils';

const initialData = {
  User: [
    {
      name: 'Boris Bozic',
      email: 'boris@keystonejs.com',
      password: 'correctbattery',
      isAdmin: true,
    },
    { name: 'Jed Watson', email: 'jed@keystonejs.com', password: 'horsestaple', isAdmin: false },
  ],
};

const COOKIE_SECRET = 'qwertyuiopasdfghjlkzxcvbmnm1234567890';
const defaultAccess = ({ context }: { context: KeystoneContext }) => !!context.session;

function setup(options?: any) {
  const auth = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    sessionData: 'id name email isAdmin',
    ...options,
  });

  return setupTestRunner({
    config: auth.withAuth(
      apiTestConfig({
        lists: {
          Post: list({
            fields: {
              title: text(),
              postedAt: timestamp(),
            },
            access: {
              operation: {
                create: ({ session }) => !!session?.data?.isAdmin,
                query: defaultAccess,
                update: defaultAccess,
                delete: defaultAccess,
              },
            },
          }),
          User: list({
            fields: {
              name: text(),
              email: text({ isIndexed: 'unique' }),
              isAdmin: checkbox(),
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
        session: storedSessions({
          store: redisSessionStore({ client: createClient() }),
          secret: COOKIE_SECRET,
        }),
      })
    ),
  });
}

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
    setup()(async ({ context }) => {
      await seed(context, initialData);
      const { data, errors } = await context.graphql.raw({ query: '{ users { id } }' });
      expect(data).toEqual({ users: [] });
      expect(errors).toBe(undefined);

      const result = await context.graphql.raw({
        query: `mutation { updateUser(where: { email: "boris@keystonejs.com" }, data: { password: "new_password" }) { id } }`,
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

  describe('logged in', () => {
    test(
      'Allows access with cookie',
      setup()(async ({ context, graphQLRequest }) => {
        await seed(context, initialData);
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

    test(
      'Can create Post using isAdmin on session',
      setup()(async ({ context, graphQLRequest }) => {
        await seed(context, initialData);
        const { sessionToken } = await login(
          graphQLRequest,
          initialData.User[0].email,
          initialData.User[0].password
        );

        expect(sessionToken).toBeTruthy();

        const { body } = await graphQLRequest({
          query: `mutation { createPost( data: { title: "The Test Post" }) {
          id
          title
        } }`,
        }).set('Cookie', `keystonejs-session=${sessionToken}`);
        const { data, errors } = body;
        expect(data).toHaveProperty('createPost');
        expect(data.createPost.title).toBe('The Test Post');
        expect(errors).toBe(undefined);
      })
    );

    test(
      'Ending the session ends the session',
      setup()(async ({ context, graphQLRequest }) => {
        await seed(context, initialData);
        const { sessionToken } = await login(
          graphQLRequest,
          initialData.User[0].email,
          initialData.User[0].password
        );

        expect(sessionToken).toBeTruthy();

        const { body: endSession } = await graphQLRequest({
          query: `mutation { endSession}`,
        }).set('Cookie', `keystonejs-session=${sessionToken}`);

        expect(endSession.data).toHaveProperty('endSession');
        expect(endSession.data.endSession).toBe(true);

        const { body } = await graphQLRequest({
          query: `mutation { createPost( data: { title: "The Test Post" }) {
          id
          title
        } }`,
        }).set('Cookie', `keystonejs-session=${sessionToken}`);

        const { data, errors } = body;

        expect(data).toHaveProperty('createPost');
        expect(data.createPost).toBe(null);
        expectAccessDenied(errors, [
          {
            path: ['createPost'],
            msg: "You cannot perform the 'create' operation on the list 'Post'.",
          },
        ]);
      })
    );

    test(
      'Invalid session receives nothing',
      setup()(async ({ context, graphQLRequest }) => {
        await seed(context, initialData);
        const { body } = await graphQLRequest({ query: '{ users { id } }' }).set(
          'Cookie',
          `keystonejs-session=invalidfoo`
        );

        const { data, errors } = body;
        expect(data).toHaveProperty('users');
        expect(data.users).toHaveLength(0); // nothing
        expect(errors).toBe(undefined);
      })
    );

    test(
      'Session is dropped if user is removed',
      setup()(async ({ context, graphQLRequest }) => {
        const { User: users } = await seed(context, initialData);
        const { sessionToken } = await login(
          graphQLRequest,
          initialData.User[0].email,
          initialData.User[0].password
        );

        {
          const { body } = await graphQLRequest({ query: '{ users { id } }' }).set(
            'Cookie',
            `keystonejs-session=${sessionToken}` // still valid
          );

          const { data, errors } = body;
          expect(data).toHaveProperty('users');
          expect(data.users).toHaveLength(2); // something
          expect(errors).toBe(undefined);
        }

        // delete the user we authenticated for
        await graphQLRequest({
          query: `mutation ($id: ID!) { deleteUser(where: { id: $id }) { id } }`,
          variables: { id: users[0]?.id },
        }).set('Cookie', `keystonejs-session=${sessionToken}`);

        {
          const { body } = await graphQLRequest({ query: '{ users { id } }' }).set(
            'Cookie',
            `keystonejs-session=${sessionToken}` // now invalid
          );

          const { data, errors } = body;
          expect(data).toHaveProperty('users');
          expect(data.users).toHaveLength(0); // nothing
          expect(errors).toBe(undefined);
        }
      })
    );

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
            `);
    });

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
            `);
    });
  });
});
