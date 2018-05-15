const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const { Text, Relationship, Select, Password } = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');
const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');
const TwitterAuthStrategy = require('@keystonejs/core/auth/Twitter');

const PORT = process.env.PORT || 3000;
const TWITTER_ENABLED = process.env.TWITTER_APP_KEY && process.env.TWITTER_APP_SECRET;

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

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    password: { type: Password },
    // twitter: { type: TwitterFieldType },
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
  port: PORT,
});

server.app.use(
  keystone.session.validate({
    valid: ({ req, item }) => (req.user = item),
  })
);

if (TWITTER_ENABLED) {
  const twitterAuth = keystone.createAuthStrategy({
    type: TwitterAuthStrategy,
    list: 'User',
    config: {
      consumerKey: process.env.TWITTER_APP_KEY,
      consumerSecret: process.env.TWITTER_APP_SECRET,
      callbackURL: `http://localhost:${PORT}/auth/twitter/callback`,
      idField: 'twitterId',
      usernameField: 'twitterUsername',
      server,
    }
  });

  // Hit this route to start the twitter auth process
  server.app.get(
    '/auth/twitter',
    twitterAuth.loginMiddleware({
      // If not set, will just call `next()`
      sessionExists: (itemId, req, res) => {
        console.log(`Already logged in as ${itemId} 🎉`);
        // logged in already? Send 'em home!
        return res.redirect('/api/session');
      }
    }),
  );

  // Twitter will redirect the user to this URL after approval.
  server.app.get('/auth/twitter/callback', twitterAuth.authenticateMiddleware({
    async verified(item, info, req, res) {
      if (!item) {
        return res.redirect('/auth/twitter/details');
      }

      res.redirect('/api/session');
    },
    failedVerification(error, req, res) {
      console.log('🤔 Failed to verify Twitter login creds');
      res.redirect('/');
    },
  }));

  server.app.get(
    '/auth/twitter/details',
    (req, res) => {
      if (req.user) {
        return res.redirect('/api/session');
      }

      res.send(`
        <form action="/auth/twitter/complete" method="post">
          <input type="text" placeholder="name" name="name" />
          <button type="submit">Submit</button>
        </form>
      `);
    }
  );

  server.app.use(server.express.urlencoded());

  server.app.post(
    '/auth/twitter/complete',
    async (req, res, next) => {
      if (req.user) {
        return res.redirect('/api/session');
      }

      try {
        const list = keystone.getListByKey('User');

        const item = await keystone.createItem(list.key, {
          name: req.body.name,
        });

        await keystone.auth.User.twitter.connectItem(req, { item });
        await keystone.session.create(req, { item, list });
        res.redirect('/api/session');
      } catch (createError) {
        next(createError);
      }
    }
  );
}

server.app.get('/api/session', (req, res) => {
  res.json({
    signedIn: !!req.session.keystoneItemId,
    userId: req.session.keystoneItemId,
    name: req.user ? req.user.name : undefined,
    twitterId: req.user ? req.user.twitterId : undefined,
    twitterUsername: req.user ? req.user.twitterUsername : undefined,
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
    res.end('Done.');
    //res.redirect('/admin');
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
