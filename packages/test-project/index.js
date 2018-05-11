const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const { Text, Relationship, Select, Password } = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');

const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');

// const {
//   TwitterAuthStrategy,
//   TwitterFieldType,
// } = require('@keystonejs/auth-twitter');

// TODO: Make this work again
// const SecurePassword = require('./custom-fields/SecurePassword');

const initialData = require('./data');

const keystone = new Keystone({
  name: 'Test Project',
});

keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  // getRole(item) {
  //   return item.isAdmin ? 'user-admin' : 'user';
  // },
  // resetPasswordEmailConfig: {
  //   emailProvider: hereIsMyConfiguredMandrillEmailSender,
  //   template: './emails/forgotten-password.pug',
  // },
});

/*
  endpoints:
    login
    logout
    getsession
  middleware:
    init session
  functionality:
    validate session, retrieve user
    create session
    - signup
    - forget password
*/

// keystone.createAuthStrategy({
//   type: TwitterAuthStrategy,
//   list: 'User',
//   config: {
//     twitterField: 'twitter',
//   },
// });

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    // twitter: { type: TwitterFieldType },
    company: {
      type: Select,
      options: [
        { label: 'Thinkmill', value: 'thinkmill' },
        { label: 'Atlassian', value: 'atlassian' },
        { label: 'Thomas Walker Gelato', value: 'gelato' },
      ],
    },
    password: { type: Password },
  },
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
});

keystone.createList('PostCategory', {
  fields: {
    name: { type: Text },
    slug: { type: Text },
  },
});

const admin = new AdminUI(keystone, {
  'user model': 'User',
});

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  adminPath: '/admin',
  session: true,
});

server.app.use(
  keystone.session.validate({
    valid: ({ req, item }) => (req.user = item),
  })
);

server.app.get('/api/session', (req, res) => {
  res.json({
    signedIn: !!req.session.keystoneItemId,
    userId: req.session.keystoneItemId,
    name: req.user ? req.user.name : undefined,
  });
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

/*
server.app.get('/api/forgot-password', async (req, res) => {
  const token = await keystone.auth.User.password.generateResetToken({
    username: req.query.username,
  });
  if (token) {
    // send email
  }
  return res.json({ success: true });
});

server.app.get('/api/reset-password', async (req, res) => {
  const user = await keystone.auth.User.password.validateResetToken({
    token: req.query.token,
  });
  if (!user) {
    return res.json({ success: true });
  }
  const result = await keystone.signIn(user);
  res.json(result);
});

server.app.get('/api/signin-with-twitter', async (req, res) => {
  const result = await keystone.auth.User.twitter.validate({
    token: req.query.token,
    tokenSecret: req.query.tokenSecret,
  });

  // => {
  //   item: item || null,
  //   twitterSessionId: ID,
  //   twitterUser: 'jedwatson',
  //   name: 'Jed Watson',
  //   ...
  // }
  if (!result.success) {
    res.json({ error: result });
  } else if (result.item) {
    const session = await keystone.signIn(result.item, {
      twitterSessionId: result.twitterSessionId,
    });
    res.json({ signedIn: true, user: result.item, session });
    // } else {
    //   const user = await keystone.lists.User.create({
    //     name: result.twitterName,
    //     twitterId: result.twitterId,
    //   });
    //   const session = await keystone.signIn(user);
    //   res.json(session);
  } else {
    res.json({ signedIn: false, twitterStuff: result });
  }
});

*/
// TODO - keystone.session.authMiddleware
const authMiddleware = (req, res, next) => next();

server.app.get('/reset-db', authMiddleware, (req, res) => {
  const reset = async () => {
    await keystone.mongoose.connection.dropDatabase();
    await keystone.createItems(initialData);
    res.redirect('/admin');
  };
  reset();
});

async function start() {
  keystone.connect();
  server.start();
  const users = await keystone.lists.User.model.find();
  if (!users.length) {
    await keystone.mongoose.connection.dropDatabase();
    await keystone.createItems(initialData);
  }
}

start();
