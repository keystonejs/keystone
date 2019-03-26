const supertest = require('supertest-light');
const { Keystone } = require('@keystone-alpha/keystone');
const { Text, Password } = require('@keystone-alpha/fields');
const { WebServer } = require('@keystone-alpha/server');
const PasswordAuthStrategy = require('@keystone-alpha/keystone/auth/Password');
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

function setupKeystone() {
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

  const server = new WebServer(keystone, {
    'cookie secret': COOKIE_SECRET,
    apiPath: '/admin/api',
    graphiqlPath: '/admin/graphiql',
  });

  server.app.post(
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

  return { keystone, server };
}

function login(server, username, password) {
  return supertest(server.app)
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
        runner(setupKeystone, async ({ server: { server } }) => {
          // seed the db
          await server.keystone.createItems(initialData);
          return supertest(server.app)
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
          runner(setupKeystone, async ({ server: { server } }) => {
            await server.keystone.createItems(initialData);
            const { success, token } = await login(
              server,
              initialData.User[0].email,
              initialData.User[0].password
            );

            expect(success).toBe(true);
            expect(token).toBeTruthy();

            return supertest(server.app)
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
          runner(setupKeystone, async ({ server: { server } }) => {
            await server.keystone.createItems(initialData);
            const { success, token } = await login(
              server,
              initialData.User[0].email,
              initialData.User[0].password
            );

            expect(success).toBe(true);
            expect(token).toBeTruthy();

            return supertest(server.app)
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
