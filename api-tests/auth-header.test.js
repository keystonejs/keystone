const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Password, DateTime } = require('@keystonejs/fields');
const { multiAdapterRunners, networkedGraphqlRequest } = require('@keystonejs/test-utils');
const { setupServer } = require('@keystonejs/test-utils');
const cuid = require('cuid');

const initialData = {
  User: [
    {
      name: 'Boris Bozic',
      email: 'boris@keystone.com',
      password: 'correctbattery',
    },
    {
      name: 'Jed Watson',
      email: 'jed@keystone.com',
      password: 'horsestaple',
    },
  ],
};

const COOKIE_SECRET = 'qwerty';
const defaultAccess = ({ authentication: { item } }) => !!item;

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `Jest Test Project For Login Auth ${cuid()}`,
    createLists: keystone => {
      keystone.createList('Post', {
        fields: {
          title: { type: Text },
          postedAt: { type: DateTime },
        },
      });

      keystone.createList('User', {
        fields: {
          name: { type: Text },
          email: { type: Text },
          password: { type: Password },
        },
        access: {
          create: defaultAccess,
          read: defaultAccess,
          update: defaultAccess,
          delete: defaultAccess,
          auth: true,
        },
      });

      keystone.createAuthStrategy({
        type: PasswordAuthStrategy,
        list: 'User',
      });
    },
    keystoneOptions: {
      cookieSecret: COOKIE_SECRET,
      defaultAccess: {
        list: defaultAccess,
      },
    },
  });
}

function login(app, email, password) {
  return networkedGraphqlRequest({
    app,
    query: `
      mutation($email: String, $password: String) {
        authenticateUserWithPassword(email: $email, password: $password) {
          token
        }
      }
    `,
    variables: { email, password },
  }).then(({ data }) => {
    return data.authenticateUserWithPassword || {};
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('Auth testing', () => {
      test(
        'Gives access denied when not logged in',
        runner(setupKeystone, async ({ keystone, app }) => {
          // seed the db
          await keystone.createItems(initialData);
          const { data, errors } = await networkedGraphqlRequest({
            app,
            query: '{ allUsers { id } }',
          });
          expect(data).toEqual({ allUsers: null });
          expect(errors).toMatchObject([{ name: 'AccessDeniedError' }]);
        })
      );

      describe('logged in', () => {
        test(
          'Allows access with bearer token',
          runner(setupKeystone, async ({ keystone, app }) => {
            await keystone.createItems(initialData);
            const { token } = await login(
              app,
              initialData.User[0].email,
              initialData.User[0].password
            );

            expect(token).toBeTruthy();
            const { data, errors } = await networkedGraphqlRequest({
              app,
              headers: {
                Authorization: `Bearer ${token}`,
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
          runner(setupKeystone, async ({ keystone, app }) => {
            await keystone.createItems(initialData);
            const { token } = await login(
              app,
              initialData.User[0].email,
              initialData.User[0].password
            );

            expect(token).toBeTruthy();

            const { data, errors } = await networkedGraphqlRequest({
              app,
              headers: {
                Cookie: `keystone.sid=s:${token}`,
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
