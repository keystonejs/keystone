const supertest = require('supertest');
const { Keystone } = require('@keystonejs/core');
const { Text, Password } = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');
const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');
const bodyParser = require('body-parser');
const { resolveAllKeys, mapKeys } = require('@keystonejs/utils');
const cookieSignature = require('cookie-signature');

const initialData = require('../data');

const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

describe('Auth testing', () => {
  const keystone = new Keystone({
    name: 'Jest Test Project For Login Auth',
    adapter: new MongooseAdapter(),
    defaultAccess: {
      list: ({ authentication: { item } }) => !!item,
    },
  });

  // eslint-disable-next-line no-unused-vars
  const authStrategy = keystone.createAuthStrategy({
    type: PasswordAuthStrategy,
    list: 'User',
  });

  keystone.createList('User', {
    fields: {
      name: { type: Text },
      email: { type: Text },
      password: { type: Password },
    },
  });

  const COOKIE_SECRET = 'qwerty';

  const server = new WebServer(keystone, {
    'cookie secret': COOKIE_SECRET,
    authStrategy: authStrategy,
    apiPath: '/admin/api',
    graphiqlPath: '/admin/graphiql',
  });

  server.app.post(
    '/signin',
    bodyParser.json(),
    bodyParser.urlencoded(),
    async (req, res, next) => {
      // Cleanup any previous session
      await keystone.session.destroy(req);

      try {
        const result = await keystone.auth.User.password.validate({
          username: req.body.username,
          password: req.body.password,
        });
        if (!result.success) {
          return res.json({
            success: false,
          });
        }
        await keystone.session.create(req, result);
        res.json({
          success: true,
          token: req.sessionID,
        });
      } catch (e) {
        next(e);
      }
    }
  );

  function login(username, password) {
    return supertest(server.app)
      .post('/signin')
      .set('Accept', 'application/json')
      .send({ username, password })
      .expect(200)
      .then(({ body }) => body);
  }

  function signCookie(token) {
    return `s:${cookieSignature.sign(token, COOKIE_SECRET)}`;
  }

  beforeAll(() => {
    keystone.connect();
  });

  afterAll(() =>
    resolveAllKeys(mapKeys(keystone.adapters, adapter => adapter.close())));

  beforeEach(async () => {
    // clean the db
    await resolveAllKeys(
      mapKeys(keystone.adapters, adapter => adapter.dropDatabase())
    );
    // seed the db
    await keystone.createItems(initialData);
  });

  test('Gives access denied when not logged in', () => {
    return supertest(server.app)
      .post('/admin/api')
      .send({ query: '{ allUsers { id } }' })
      .set('Accept', 'application/json')
      .expect(200)
      .expect(function(res) {
        expect(res.body.data).toEqual({ allUsers: null });
        expect(res.body.errors).toMatchObject([{ name: 'AccessDeniedError' }]);
      });
  });

  describe('logged in', () => {
    test('Allows access with bearer token', async () => {
      const { success, token } = await login(
        initialData.User[0].email,
        initialData.User[0].password
      );

      expect(success).toBe(true);
      expect(token).toBeTruthy();

      return supertest(server.app)
        .post('/admin/api')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({ query: '{ allUsers { id } }' })
        .expect(200)
        .expect(function(res) {
          expect(res.body.data).toHaveProperty('allUsers');
          expect(res.body.data.allUsers).toHaveLength(initialData.User.length);
          expect(res.body).not.toHaveProperty('errors');
        });
    });

    test('Allows access with cookie', async () => {
      const { success, token } = await login(
        initialData.User[0].email,
        initialData.User[0].password
      );

      expect(success).toBe(true);
      expect(token).toBeTruthy();

      return supertest(server.app)
        .post('/admin/api')
        .set('Cookie', `keystone.sid=${signCookie(token)}`)
        .set('Accept', 'application/json')
        .send({ query: '{ allUsers { id } }' })
        .expect(200)
        .expect(function(res) {
          expect(res.body.data).toHaveProperty('allUsers');
          expect(res.body.data.allUsers).toHaveLength(initialData.User.length);
          expect(res.body).not.toHaveProperty('errors');
        });
    });
  });
});
