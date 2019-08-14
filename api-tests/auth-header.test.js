const supertest = require('supertest-light');
const { PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { Text, Password, DateTime } = require('@keystone-alpha/fields');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const express = require('express');
const { multiAdapterRunners } = require('@keystone-alpha/test-utils');
const { setupServer } = require('@keystone-alpha/test-utils');
const cuid = require('cuid');

const initialData = {
  User: [
    {
      name: 'Boris Bozic',
      email: 'boris@keystone-alpha.com',
      password: 'correctbattery',
    },
    {
      name: 'Jed Watson',
      email: 'jed@keystone-alpha.com',
      password: 'horsestaple',
    },
  ],
};

const COOKIE_SECRET = 'qwerty';

async function setupKeystone(adapterName) {
  const app = express();
  const { keystone } = setupServer({
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
      });

      keystone.createAuthStrategy({
        type: PasswordAuthStrategy,
        list: 'User',
      });
    },
    createApps: async keystone => {
      const graphQLApp = new GraphQLApp(keystone, {
        cookieSecret: COOKIE_SECRET,
        apiPath: '/admin/api',
        graphiqlPath: '/admin/graphiql',
      });

      app.use(await graphQLApp.prepareMiddleware({ keystone, dev: true }));
    },
    keystoneOptions: {
      defaultAccess: {
        list: ({ authentication: { item } }) => !!item,
      },
    },
  });

  return { keystone, app };
}

function login(app, email, password) {
  return supertest(app)
    .set('Accept', 'application/json')
    .post('/admin/api', {
      query: `
        mutation($email: String, $password: String) {
          authenticateUserWithPassword(email: $email, password: $password) {
            token
          }
        }
      `,
      variables: { email, password },
    })
    .then(res => {
      expect(res.statusCode).toBe(200);
      const { data } = JSON.parse(res.text);
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
          return supertest(app)
            .set('Accept', 'application/json')
            .post('/admin/api', { query: '{ allUsers { id } }' })
            .then(function(res) {
              expect(res.statusCode).toBe(200);
              res.body = JSON.parse(res.text);
              expect(res.body.data).toEqual({ allUsers: null });
              expect(res.body.errors).toMatchObject([{ name: 'AccessDeniedError' }]);
            });
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

            return supertest(app)
              .set('Authorization', `Bearer ${token}`)
              .set('Accept', 'application/json')
              .post('/admin/api', { query: '{ allUsers { id } }' })
              .then(function(res) {
                expect(res.statusCode).toBe(200);
                res.body = JSON.parse(res.text);
                expect(res.body.data).toHaveProperty('allUsers');
                expect(res.body.data.allUsers).toHaveLength(initialData.User.length);
                expect(res.body).not.toHaveProperty('errors');
              });
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

            return supertest(app)
              .set('Cookie', `keystone.sid=s:${token}`)
              .set('Accept', 'application/json')
              .post('/admin/api', { query: '{ allUsers { id } }' })
              .then(function(res) {
                expect(res.statusCode).toBe(200);
                res.body = JSON.parse(res.text);
                expect(res.body.data).toHaveProperty('allUsers');
                expect(res.body.data.allUsers).toHaveLength(initialData.User.length);
                expect(res.body).not.toHaveProperty('errors');
              });
          })
        );
      });
    });
  })
);
