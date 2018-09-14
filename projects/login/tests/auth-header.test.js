const supertest = require('supertest-light');
const { Keystone } = require('@voussoir/core');
const { Text, Password } = require('@voussoir/fields');
const { WebServer } = require('@voussoir/server');
const PasswordAuthStrategy = require('@voussoir/core/auth/Password');
const bodyParser = require('body-parser');
const { resolveAllKeys, mapKeys } = require('@voussoir/utils');
const cookieSignature = require('cookie-signature');

const initialData = require('../data');

const { MongooseAdapter } = require('@voussoir/adapter-mongoose');

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
    bodyParser.urlencoded({ extended: true }),
    async (req, res, next) => {
      // Cleanup any previous session
      await keystone.session.destroy(req);

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

  beforeAll(() => {
    keystone.connect();
  });

  afterAll(() => resolveAllKeys(mapKeys(keystone.adapters, adapter => adapter.close())));

  beforeEach(async () => {
    // clean the db
    await resolveAllKeys(mapKeys(keystone.adapters, adapter => adapter.dropDatabase()));
    // seed the db
    await keystone.createItems(initialData);
  });

  test('Gives access denied when not logged in', () => {
    return supertest(server.app)
      .set('Accept', 'application/json')
      .post('/admin/api', { query: '{ allUsers { id } }' })
      .then(function(res) {
        expect(res.statusCode).toBe(200);
        res.body = JSON.parse(res.text);
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
    });

    test('Allows access with cookie', async () => {
      const { success, token } = await login(
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
    });
  });
});
