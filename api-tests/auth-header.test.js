const supertest = require('supertest-light');
const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { Text, Password } = require('@keystone-alpha/fields');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const express = require('express');
const bodyParser = require('body-parser');
const cookieSignature = require('cookie-signature');
const { multiAdapterRunners } = require('@keystone-alpha/test-utils');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { startAuthedSession, endAuthedSession } = require('@keystone-alpha/session');
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

async function setupKeystone() {
  const keystone = new Keystone({
    name: `Jest Test Project For Login Auth ${cuid()}`,
    adapter: new MongooseAdapter(),
    defaultAccess: {
      list: ({ authentication: { item } }) => !!item,
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

  const app = express();

  const graphQLApp = new GraphQLApp(keystone, {
    cookieSecret: COOKIE_SECRET,
    apiPath: '/admin/api',
    graphiqlPath: '/admin/graphiql',
  });

  app.use(await graphQLApp.prepareMiddleware({ keystone, dev: true }));

  app.post(
    '/signin',
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      // Cleanup any previous session
      await endAuthedSession(req);

      try {
        const result = await keystone.auth.User.password.validate({
          identity: req.body.username,
          secret: req.body.password,
        });
        if (!result.success) {
          return res.json({
            success: false,
          });
        }
        await startAuthedSession(req, result);
        res.json({
          success: true,
          token: req.sessionID,
        });
      } catch (e) {
        next(e);
      }
    }
  );

  return { keystone, app };
}

function login(app, username, password) {
  return supertest(app)
    .set('Accept', 'application/json')
    .post('/signin', { username, password })
    .then(res => {
      expect(res.statusCode).toBe(200);
      return JSON.parse(res.text);
    });
}

function signCookie(token) {
  return `s:${cookieSignature.sign(token, COOKIE_SECRET)}`;
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
            const { success, token } = await login(
              app,
              initialData.User[0].email,
              initialData.User[0].password
            );

            expect(success).toBe(true);
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
            const { success, token } = await login(
              app,
              initialData.User[0].email,
              initialData.User[0].password
            );

            expect(success).toBe(true);
            expect(token).toBeTruthy();

            return supertest(app)
              .set('Cookie', `keystone.sid=${signCookie(token)}`)
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
