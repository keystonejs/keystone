const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const {
  File,
  Text,
  Relationship,
  Select,
  Password,
  CloudinaryImage,
} = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');
const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');
const {
  CloudinaryAdapter,
  LocalFileAdapter,
} = require('@keystonejs/file-adapters');

const {
  twitterAuthEnabled,
  port,
  staticRoute,
  staticPath,
  cloudinary,
} = require('./config');
const { configureTwitterAuth } = require('./twitter');

const LOCAL_FILE_PATH = `${staticPath}/avatars`;
const LOCAL_FILE_ROUTE = `${staticRoute}/avatars`;

// TODO: Make this work again
// const SecurePassword = require('./custom-fields/SecurePassword');

const initialData = require('./data');

const keystone = new Keystone({
  name: 'Test Project',
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
    name: { type: Text },
    email: { type: Text },
    password: { type: Password },
    // TODO: Create a Twitter field type to encapsulate these
    twitterId: { type: Text },
    twitterUsername: { type: Text },
    company: {
      type: Select,
      options: [
        { label: 'Thinkmill', value: 'thinkmill' },
        { label: 'Atlassian', value: 'atlassian' },
        { label: 'Thomas Walker Gelato', value: 'gelato' },
        { label: 'Cete, or Seat, or Attend ¯\\_(ツ)_/¯', value: 'cete' },
      ],
    },
    attachment: { type: File, adapter: fileAdapter },
    ...(cloudinaryAdapter
      ? { avatar: { type: CloudinaryImage, adapter: cloudinaryAdapter } }
      : {}),
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
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
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
});

keystone.createList('PostCategory', {
  fields: {
    name: { type: Text },
    slug: { type: Text },
  },
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  // authStrategy, // uncomment to enable authentication (disabled for ease of running tests)
});

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  session: true,
  port,
});

if (twitterAuthEnabled) {
  configureTwitterAuth(keystone, server);
}

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
      twitterId: req.user.twitterId,
      twitterUsername: req.user.twitterUsername,
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
    await keystone.mongoose.connection.dropDatabase();
    await keystone.createItems(initialData);
    res.redirect(admin.adminPath);
  };
  reset();
});

server.app.use(staticRoute, server.express.static(staticPath));

async function start() {
  keystone.connect();
  server.start();
  const users = await keystone.lists.User.model.find();
  if (!users.length) {
    await keystone.mongoose.connection.dropDatabase();
    await keystone.createItems(initialData);
  }
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
