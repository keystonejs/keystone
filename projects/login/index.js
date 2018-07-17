const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const { Text, Password } = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');
const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');

const { port, staticRoute, staticPath } = require('./config');

const initialData = require('./data');

const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  name: 'Cypress Test Project For Login',
  adapter: new MongooseAdapter(),
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
  labelResolver: item => `${item.name} <${item.email}>`,
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  // allow disabling of admin auth for test environments
  authStrategy: authStrategy,
});

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  session: true,
  port,
});

server.app.use(
  keystone.session.validate({
    valid: ({ req, item }) => (req.user = item),
  })
);

server.app.get('/api/session', (req, res) => {
  const data = {
    signedIn: !!req.session.keystoneItemId,
    userId: req.session.keystoneItemId,
  };
  if (req.user) {
    Object.assign(data, {
      name: req.user.name,
    });
  }
  res.json(data);
});

server.app.get('/api/signin', async (req, res, next) => {
  try {
    const result = await keystone.auth.User.password.validate({
      username: req.query.username,
      password: req.query.password,
    });
    if (!result.success) {
      return res.json({
        success: false,
      });
    }
    await keystone.session.create(req, result);
    res.json({
      success: true,
      itemId: result.item.id,
    });
  } catch (e) {
    next(e);
  }
});

server.app.get('/api/signout', async (req, res, next) => {
  try {
    await keystone.session.destroy(req);
    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

server.app.get('/reset-db', (req, res) => {
  const reset = async () => {
    Object.values(keystone.adapters).forEach(async adapter => {
      await adapter.dropDatabase();
    });
    await keystone.createItems(initialData);
    res.redirect(admin.adminPath);
  };
  reset();
});

server.app.use(staticRoute, server.express.static(staticPath));

async function start() {
  keystone.connect();
  server.start();
  const users = await keystone.lists.User.adapter.findAll();
  if (!users.length) {
    Object.values(keystone.adapters).forEach(async adapter => {
      await adapter.dropDatabase();
    });
    await keystone.createItems(initialData);
  }
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
