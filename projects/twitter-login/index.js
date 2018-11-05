const { AdminUI } = require('@voussoir/admin-ui');
const { Keystone } = require('@voussoir/core');
const {
  File,
  Text,
  Checkbox,
  Relationship,
  Select,
  Password,
  CloudinaryImage,
} = require('@voussoir/fields');
const { WebServer } = require('@voussoir/server');
const PasswordAuthStrategy = require('@voussoir/core/auth/Password');
const { CloudinaryAdapter, LocalFileAdapter } = require('@voussoir/file-adapters');

const { twitterAuthEnabled, port, staticRoute, staticPath, cloudinary } = require('./config');
const { configureTwitterAuth } = require('./twitter');

const { DISABLE_AUTH } = process.env;
const LOCAL_FILE_PATH = `${staticPath}/avatars`;
const LOCAL_FILE_ROUTE = `${staticRoute}/avatars`;

// TODO: Make this work again
// const SecurePassword = require('./custom-fields/SecurePassword');

const initialData = require('./data');

const { MongooseAdapter } = require('@voussoir/adapter-mongoose');

const keystone = new Keystone({
  name: 'Cypress Test for Twitter Login',
  adapter: new MongooseAdapter(),
});

// eslint-disable-next-line no-unused-vars
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

const fileAdapter = new LocalFileAdapter({
  directory: LOCAL_FILE_PATH,
  route: LOCAL_FILE_ROUTE,
});

let cloudinaryAdapter;
try {
  cloudinaryAdapter = new CloudinaryAdapter({
    ...cloudinary,
    folder: 'avatars',
  });
} catch (e) {
  // Downgrade from an error to a warning if the dev does not have a
  // Cloudinary API Key set up. This will disable any fields which rely
  // on this functionality.
  console.warn(e.message);
}

keystone.createList('User', {
  fields: {
    // When no access defined, defaults to all public
    name: { type: Text },
    email: {
      type: Text,
      access: {
        // defaults to 'false' for any unspecified keys, so this is technically
        // unnecessary
        read: false,
        update: ({ item, authentication }) =>
          // Authenticated against the correct list
          authentication.listKey === this.listKey &&
          // The authed item matches the item being updated
          item.id === authentication.item.id,
      },
    },
    password: {
      type: Password,
      access: {
        update: ({ item, authentication }) =>
          authentication.listKey === this.listKey && item.id === authentication.item.id,
      },
    },
    // TODO: Create a Twitter field type to encapsulate these
    twitterId: { type: Text },
    twitterUsername: { type: Text },
    isAdmin: { type: Checkbox },
    company: {
      type: Select,
      options: [
        { label: 'Thinkmill', value: 'thinkmill' },
        { label: 'Atlassian', value: 'atlassian' },
        { label: 'Thomas Walker Gelato', value: 'gelato' },
        { label: 'Cete, or Seat, or Attend ¯\\_(ツ)_/¯', value: 'cete' },
      ],
    },
    notes: {
      type: Relationship,
      ref: 'Note',
      many: true,
      // NOTE: No access listed for this field as the related list already has
      // its own access control setup
    },
    attachment: { type: File, adapter: fileAdapter },
    ...(cloudinaryAdapter ? { avatar: { type: CloudinaryImage, adapter: cloudinaryAdapter } } : {}),
  },
  labelResolver: item => `${item.name} <${item.email}>`,
});

keystone.createList('Post', {
  fields: {
    name: { type: Text },
    slug: { type: Text },
    status: {
      type: Select,
      defaultValue: 'draft',
      options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
    },
    author: {
      type: Relationship,
      ref: 'User',
    },
    categories: {
      type: Relationship,
      ref: 'PostCategory',
      many: true,
    },
  },
  labelResolver: item => item.name,
  access: {
    read: true,
    create: ({ item, authentication }) =>
      authentication.listKey === authStrategy.listKey && item.user.id === authentication.item.id,
    update: ({ item, authentication }) =>
      authentication.listKey === authStrategy.listKey && item.user.id === authentication.item.id,
    delete: ({ item, authentication }) =>
      authentication.listKey === authStrategy.listKey && item.user.id === authentication.item.id,
  },
});

keystone.createList('PostCategory', {
  fields: {
    name: { type: Text },
    slug: { type: Text },
  },
  access: {
    create: true,
    read: true,
    update: false,
    delete: false,
  },
});

keystone.createList('Note', {
  fields: {
    note: { type: Text },
    user: {
      type: Relationship,
      ref: 'User',
    },
  },
  // All access to notes limited to authenticated person
  access: ({ item, authentication }) =>
    authentication.listKey === authStrategy.listKey && item.user.id === authentication.item.id,
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  // allow disabling of admin auth for test environments
  authStrategy: DISABLE_AUTH ? undefined : authStrategy,
});

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  port,
});

if (twitterAuthEnabled) {
  configureTwitterAuth(keystone, server);
}

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
