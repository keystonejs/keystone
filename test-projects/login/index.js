const { AdminUI } = require('@voussoir/admin-ui');
const { Keystone } = require('@voussoir/core');
const { Text, Password, Relationship } = require('@voussoir/fields');
const { WebServer } = require('@voussoir/server');
const PasswordAuthStrategy = require('@voussoir/core/auth/Password');
const bodyParser = require('body-parser');

const { port, staticRoute, staticPath } = require('./config');

const initialData = require('./data');

const { MongooseAdapter } = require('@voussoir/adapter-mongoose');

const keystone = new Keystone({
  name: 'Cypress Test Project For Login',
  adapter: new MongooseAdapter(),
  defaultAccess: {
    list: ({ authentication: { item } }) => !!item,
  },
});

// eslint-disable-next-line no-unused-vars
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  // config: { protectIdentities: true },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    password: { type: Password },
  },
  labelResolver: item => `${item.name} <${item.email}>`,
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    author: { type: Relationship, ref: 'User' },
    editors: { type: Relationship, ref: 'User', many: true },
  },
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
});

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  authStrategy: authStrategy,
  apiPath: '/admin/api',
  graphiqlPath: '/admin/graphiql',
  port,
});

server.app.get('/api/session', (req, res) => {
  const data = {
    signedIn: !!req.session.keystoneItemId,
    userId: req.session.keystoneItemId,
  };
  if (req.user) {
    data.name = req.user.name;
  }
  res.json(data);
});

server.app.post(
  '/signin',
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
  async (req, res, next) => {
    // Cleanup any previous session
    await keystone.sessionManager.endAuthedSession(req);

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
      await keystone.sessionManager.startAuthedSession(req, result);
      res.json({
        success: true,
        itemId: result.item.id,
        token: req.sessionID,
      });
    } catch (e) {
      next(e);
    }
  }
);

server.app.get('/signout', async (req, res, next) => {
  try {
    await keystone.sessionManager.endAuthedSession(req);
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
  await keystone.connect();
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
