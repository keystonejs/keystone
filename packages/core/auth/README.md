# Authentication Strategies

## Twitter

### Usage

#### 0-step new user creation

```javascript
server.app.use(
  keystone.session.validate({
    // When logged in, we'll get a req.user object
    valid: ({ req, item }) => (req.user = item),
  })
);

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
    const authedItem = item || await keystone.createItem(info.list.key, {});

    try {
      await keystone.auth.User.twitter.connectItem(req, { item: authedItem });
      await keystone.session.create(req, { item: authedItem, list: info.list });
    } catch (createError) {
      return res.json({
        success: false,
        // TODO: Better error
        error: createError.message || createError.toString(),
      });
    }

    res.redirect('/api/session');
  },
  failedVerification(error, req, res) {
    console.log('🤔 Failed to verify Twitter login creds');
    res.redirect('/');
  },
}));
```

#### Multi-step new user creation

eg; After giving permission to Twitter, we then want to ask for an email, an
address, their social security info, their mother's maiden name, and their
bank's password over multiple server requests / page refreshes:

```javascript
server.app.use(
  keystone.session.validate({
    // When logged in, we'll get a req.user object
    valid: ({ req, item }) => (req.user = item),
  })
);

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
    // Twitter is verified, but we need some more details from the user
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

    // Capture details somehow
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

    // Finally, we have all the info we need to create a new user and log that
    // user in
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
```
