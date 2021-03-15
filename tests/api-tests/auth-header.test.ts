import Iron from '@hapi/iron';
import express from 'express';
import { text, timestamp, password } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { statelessSessions, withItemData } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import {
  multiAdapterRunners,
  setupFromConfig,
  networkedGraphqlRequest,
  AdapterName,
  testConfig,
} from '@keystone-next/test-utils-legacy';
// @ts-ignore
import { createItems } from '@keystone-next/server-side-graphql-client-legacy';
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
const defaultAccess = ({ context }: { context: KeystoneContext }) => !!context.session?.item;

const auth = createAuth({ listKey: 'User', identityField: 'email', secretField: 'password' });

function setupKeystone(adapterName: AdapterName) {
  return setupFromConfig({
    adapterName,
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
        session: withItemData(statelessSessions({ secret: COOKIE_SECRET }), { User: 'id' }),
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

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('Auth testing', () => {
      test(
        'Gives access denied when not logged in',
        runner(setupKeystone, async ({ context, app }) => {
          // seed the db
          for (const [listKey, items] of Object.entries(initialData)) {
            await createItems({ context, listKey, items });
          }
          const { data, errors } = await networkedGraphqlRequest({
            app,
            query: '{ allUsers { id } }',
          });
          expect(data).toEqual({ allUsers: null });
          expect(errors).toMatchObject([{ name: 'AccessDeniedError' }]);
        })
      );

      describe('logged in', () => {
        // eslint-disable-next-line jest/no-disabled-tests
        test.skip(
          'Allows access with bearer token',
          runner(setupKeystone, async ({ context, app }) => {
            for (const [listKey, items] of Object.entries(initialData)) {
              await createItems({ context, listKey, items });
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
            for (const [listKey, items] of Object.entries(initialData)) {
              await createItems({ context, listKey, items });
            }
            const { sessionToken, item } = await login(
              app,
              initialData.User[0].data.email,
              initialData.User[0].data.password
            );

            expect(sessionToken).toBeTruthy();

            const sealedData = await Iron.seal({ item }, COOKIE_SECRET, Iron.defaults);
            const { data, errors } = await networkedGraphqlRequest({
              app,
              headers: {
                Cookie: `keystonejs-session=${sealedData}`,
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
