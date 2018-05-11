const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const { Text, Relationship, Select, Password } = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');
const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');
const TwitterAuthStrategy = require('@keystonejs/core/auth/Twitter');
const passport = require('passport');
const PassportTwitter = require('passport-twitter');

const PORT = process.env.PORT || 3000;
const TWITTER_ENABLED = process.env.TWITTER_APP_KEY && process.env.TWITTER_APP_SECRET;

if (TWITTER_ENABLED) {
  passport.use(
    new PassportTwitter(
      {
        consumerKey: process.env.TWITTER_APP_KEY,
        consumerSecret: process.env.TWITTER_APP_SECRET,
        callbackURL: `http://localhost:${PORT}/auth/twitter/callback`,
        passReqToCallback: true,
      },
      /**
       * from: https://github.com/jaredhanson/passport-oauth1/blob/master/lib/strategy.js#L24-L37
       * ---
       * Applications must supply a `verify` callback, for which the function
       * signature is:
       *
       *     function(token, tokenSecret, oauthParams, profile, done) { ... }
       *
       * The verify callback is responsible for finding or creating the user, and
       * invoking `done` with the following arguments:
       *
       *     done(err, user, info);
       *
       * `user` should be set to `false` to indicate an authentication failure.
       * Additional `info` can optionally be passed as a third argument, typically
       * used to display informational messages.  If an exception occured, `err`
       * should be set.
       */
      async function verify(req, token, tokenSecret, oauthParams, profile, done) {
        try {
          let result = await keystone.auth.User.twitter.validate({ token, tokenSecret });
          if (!result.success) {
            // false indicates an authentication failure
            return done(null, false, result);

          }
          return done(null, result.item, result);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
}


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

if (TWITTER_ENABLED) {
  keystone.createAuthStrategy({
    type: TwitterAuthStrategy,
    list: 'User',
    config: {
      key: process.env.TWITTER_APP_KEY,
      secret: process.env.TWITTER_APP_SECRET,
      idField: 'twitterId',
      usernameField: 'twitterUsername',
    }
  });
}
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

if (TWITTER_ENABLED) {
  server.app.use(passport.initialize());
  // Hit this route to start the twitter auth process
  server.app.get('/auth/twitter', (req, res, next) => {
    if (req.session.keystoneItemId) {
      // logged in already? Send 'em home!
      return res.redirect('/api/session');
    }

    // If the user isn't already logged in
    // kick off the twitter auth process
    passport.authenticate('twitter', { session: false })(req, res, next);
  });

  // Twitter will redirect the user to this URL after approval.
  server.app.get('/auth/twitter/callback', (req, res, next) => {
    // This middleware will call the `verify` callback we passed up the top to
    // the `new PassportTwitter` constructor
    passport.authenticate('twitter', async (verifyError, authedItem, info) => {
      if (verifyError) {
        return res.json({
          success: false,
          // TODO: Better error
          error: verifyError.message || verifyError.toString(),
        });
      }

      try {
        if (!authedItem) {
          if (info.newUser) {
            // Twitter authed, but no known user
            // TODO: Trigger "new user" flow and somehow store the authed twitter
            // token/id on the session so it's available across multiple requests
            const newItem = await keystone.createItem(info.list.key, {});

            await keystone.auth.User.twitter.connectItem({ twitterSession: info.twitterSession, item: newItem });
            await keystone.session.create(req, { item: newItem, list: info.list });

            res.redirect('/api/session');
          } else {
            // Really, this condition shouldn't be possible
            throw new Error('Twitter login could not find an existing user, or create a twitter session. This is bad.');
          }
        } else {
          // TODO: Test
          await keystone.session.create(req, info);
          res.redirect('/api/session');
        }
      } catch (createError) {
        res.json({
          success: false,
          // TODO: Better error
          error: createError.message || createError.toString(),
        });
      }
    })(req, res, next);
  });
}

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
