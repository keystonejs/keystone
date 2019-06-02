<!--[meta]
section: packages
title: Passport Auth Strategy
[meta]-->

# Passport Auth Strategy

This package adds Auth Strategies based on popular social login service (Twitter/Facebook/Google and Github) for KeystoneJs. You can setup and enable social authentication in your Keystone app as explained here. It also enables you to easily extend base `PassportAuthStrategy` to add your own Auth Strategy based on PassportJs with minimal effort.

### Important

To be flexible in use of middleware and how they are arranged in stack, we do not bind `passport` middleware in express server. You must add following line or use one of the helper function we provide out of the box to enable use of PassportJs based auth strategy. This must be added after call to `keystone.connect()` see `social-login` test project for more details.

> Remember to organize the code in such a way that you call `keystone.conenct()` between `keystone.createAuthStrategy({...})` and mounting of routes/middleware.

your own instance of express `app`

```js
app.use(passport.initialize());
```

or the helper function

```js
const { InitializePassportAuthStrategies } = require('@keystone-alpha/passport-auth');
InitializePassportAuthStrategies(app); // you can use server.app
```

## Twitter

### Usage

#### 0-step new user creation

```javascript
const { TwitterAuthStrategy } = require('@keystone-alpha/passport-auth');

const cookieSecret = '<the same as passed to your `app-graphql` instance>';

const twitterAuth = keystone.createAuthStrategy({
  type: TwitterAuthStrategy,
  list: 'User',
  config: {
    consumerKey: process.env.TWITTER_APP_KEY,
    consumerSecret: process.env.TWITTER_APP_SECRET,
    callbackURL: `http://localhost:${PORT}/auth/twitter/callback`,
  },
});

// ......
// keystone.conenct() // called here.
// .......

// Hit this route to start the twitter auth process
server.app.get(
  '/auth/twitter',
  twitterAuth.loginMiddleware({
    // If not set, will just call `next()`
    sessionExists: (itemId, req, res) => {
      console.log(`Already logged in as ${itemId} 🎉`);
      // logged in already? Send 'em home!
      return res.redirect('/');
    },
  })
);

// Twitter will redirect the user to this URL after approval.
server.app.get(
  '/auth/twitter/callback',
  twitterAuth.authenticateMiddleware({
    async verified(item, info, req, res) {
      const authedItem = item || (await keystone.createItem(info.list.key, {}));

      try {
        await keystone.auth.User.twitter.connectItem(req, { item: authedItem });
        await keystone.sessionManager.startAuthedSession(req, {
          item: authedItem,
          list: info.list,
        }, ['admin'], cookieSecret);
      } catch (createError) {
        return res.json({
          success: false,
          // TODO: Better error
          error: createError.message || createError.toString(),
        });
      }

      res.redirect('/');
    },
    failedVerification(error, req, res) {
      console.log('🤔 Failed to verify Twitter login creds');
      res.redirect('/');
    },
  })
);
```

#### Multi-step new user creation

eg; After giving permission to Twitter, we then want to ask for an email, an
address, their social security info, their mother's maiden name, and their
bank's password over multiple server requests / page refreshes:

```javascript
const { TwitterAuthStrategy } = require('@keystone-alpha/passport-auth');

const cookieSecret = '<the same as passed to your `app-graphql` instance>';

const twitterAuth = keystone.createAuthStrategy({
  type: TwitterAuthStrategy,
  list: 'User',
  config: {
    consumerKey: process.env.TWITTER_APP_KEY,
    consumerSecret: process.env.TWITTER_APP_SECRET,
    callbackURL: `http://localhost:${PORT}/auth/twitter/callback`,
  },
});

// ......
// keystone.conenct() // called here.
// .......

// Hit this route to start the twitter auth process
server.app.get(
  '/auth/twitter',
  twitterAuth.loginMiddleware({
    // If not set, will just call `next()`
    sessionExists: (itemId, req, res) => {
      console.log(`Already logged in as ${itemId} 🎉`);
      // logged in already? Send 'em home!
      return res.redirect('/');
    },
  })
);

// Twitter will redirect the user to this URL after approval.
server.app.get(
  '/auth/twitter/callback',
  twitterAuth.authenticateMiddleware({
    async verified(item, info, req, res) {
      // Twitter is verified, but we need some more details from the user
      if (!item) {
        return res.redirect('/auth/twitter/details');
      }

      res.redirect('/');
    },
    failedVerification(error, req, res) {
      console.log('🤔 Failed to verify Twitter login creds');
      res.redirect('/');
    },
  })
);

server.app.get('/auth/twitter/details', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }

  // Capture details somehow
  res.send(`
      <form action="/auth/twitter/complete" method="post">
        <input type="text" placeholder="name" name="name" />
        <button type="submit">Submit</button>
      </form>
    `);
});

server.app.use(server.express.urlencoded({ extended: true }));

server.app.post('/auth/twitter/complete', async (req, res, next) => {
  if (req.user) {
    return res.redirect('/');
  }

  // Finally, we have all the info we need to create a new user and log that
  // user in
  try {
    const list = keystone.getListByKey('User');

    const item = await keystone.createItem(list.key, {
      name: req.body.name,
    });

    await keystone.auth.User.twitter.connectItem(req, { item });
    await keystone.sessionManager.startAuthedSession(req, { item, list }, ['admin'], cookieSecret);
    res.redirect('/');
  } catch (createError) {
    next(createError);
  }
});
```

## Facebook, Google, GitHub

#### See Twitter Example

## Using other PassportJs Strategy

### Inherit from Keystone PassportAuthStrategy

For Example, we will implement WordPress auth.
First you need to register a WordPress dev account and create and app there. Make note of App Key and App Secret

```js
const PassportWordPress = require('passport-wordpress').Strategy;
const { PassportAuthStrategy } = require('@keystone-alpha/passport-auth');

class WordPressAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(
      WordPressAuthStrategy.authType,
      keystone,
      listKey,
      {
        sessionIdField: 'wordpressSession',
        keystoneSessionIdField: 'keystoneWordPressSessionId',
        ...config,
      },
      PassportWordPress
    );
  }
}

WordPressAuthStrategy.authType = 'wordpress';

module.exports = WordPressAuthStrategy;
```

### Usage

Configure similar to Twitter Strategy

```js
const wpAuth = keystone.createAuthStrategy({
  type: WordPressAuthStrategy,
  list: 'User',
  config: {
    consumerKey: process.env.WP_APP_KEY,
    consumerSecret: process.env.WP_APP_SECRET,
    callbackURL: `http://localhost:${PORT}/auth/wordpress/callback`,
  },
});

// ......
// keystone.conenct()
// .......

// rest of the code for configuring routes, similar to Twitter
```
