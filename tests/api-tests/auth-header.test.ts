import express from 'express';
import { text, timestamp, password } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { statelessSessions } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import {
  multiAdapterRunners,
  setupFromConfig,
  networkedGraphqlRequest,
  ProviderName,
  testConfig,
} from '@keystone-next/test-utils-legacy';
import type { KeystoneContext, KeystoneConfig } from '@keystone-next/types';

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

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
    config: auth.withAuth(
      testConfig({
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
      }) as KeystoneConfig
    ),
  });
}

function login(app: express.Application, email: string, password: string) {
  return networkedGraphqlRequest({
    app,
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
  }).then(
    ({
      data,
    }: {
      data?: { authenticateUserWithPassword?: { sessionToken: string; item: { id: any } } };
    }) => {
      return data?.authenticateUserWithPassword || {};
    }
  );
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('Auth testing', () => {
      test(
        'Gives access denied when not logged in',
        runner(setupKeystone, async ({ context, app }) => {
          // seed the db
          for (const [listKey, data] of Object.entries(initialData)) {
            await context.lists[listKey].createMany({ data });
          }
          const { data, errors } = await networkedGraphqlRequest({
            app,
            query: '{ allUsers { id } }',
          });
          expect(data.allUsers).toEqual([]);
          expect(errors).toBe(undefined);
        })
      );

      describe('logged in', () => {
        // eslint-disable-next-line jest/no-disabled-tests
        test.skip(
          'Allows access with bearer token',
          runner(setupKeystone, async ({ context, app }) => {
            for (const [listKey, data] of Object.entries(initialData)) {
              await context.lists[listKey].createMany({ data });
            }
            const { sessionToken } = await login(
              app,
              initialData.User[0].data.email,
              initialData.User[0].data.password
            );

            expect(sessionToken).toBeTruthy();
            const { data, errors } = await networkedGraphqlRequest({
              app,
              headers: {
                Authorization: `Bearer ${sessionToken}`,
              },
              query: '{ allUsers { id } }',
            });

            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers).toHaveLength(initialData.User.length);
            expect(errors).toBe(undefined);
          })
        );

        test(
          'Allows access with cookie',
          runner(setupKeystone, async ({ context, app }) => {
            for (const [listKey, data] of Object.entries(initialData)) {
              await context.lists[listKey].createMany({ data });
            }
            const { sessionToken } = await login(
              app,
              initialData.User[0].data.email,
              initialData.User[0].data.password
            );

            expect(sessionToken).toBeTruthy();

            const { data, errors } = await networkedGraphqlRequest({
              app,
              headers: {
                Cookie: `keystonejs-session=${sessionToken}`,
              },
              query: '{ allUsers { id } }',
            });

            expect(data).toHaveProperty('allUsers');
            expect(data.allUsers).toHaveLength(initialData.User.length);
            expect(errors).toBe(undefined);
          })
        );
      });
    });
  })
);
