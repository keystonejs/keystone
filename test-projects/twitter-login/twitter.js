const TwitterAuthStrategy = require('@keystone-alpha/keystone/auth/Twitter');

const { appURL, twitterAppKey, twitterAppSecret } = require('./config');

exports.configureTwitterAuth = function(keystone, server) {
  const twitterAuth = keystone.createAuthStrategy({
    type: TwitterAuthStrategy,
    list: 'User',
    config: {
      consumerKey: twitterAppKey,
      consumerSecret: twitterAppSecret,
      callbackURL: `${appURL}/auth/twitter/callback`,
      idField: 'twitterId',
      usernameField: 'twitterUsername',
      server,
    },
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
      },
    })
  );

  server.app.get('/api/session', (req, res) => {
    res.json({
      signedIn: !!req.session.keystoneItemId,
      userId: req.session.keystoneItemId,
      name: req.user ? req.user.name : undefined,
    });
  });

  // Twitter will redirect the user to this URL after approval.
  server.app.get(
    '/auth/twitter/callback',
    twitterAuth.authenticateMiddleware({
      async verified(item, { list }, req, res) {
        if (!item) {
          return res.redirect('/auth/twitter/details');
        }
        await keystone.sessionManager.startAuthedSession(req, { item, list });
        res.redirect('/api/session');
      },
      failedVerification(error, req, res) {
        console.log('🤔 Failed to verify Twitter login creds');
        res.redirect('/');
      },
    })
  );

  // Sample page to collect a name, submits to the completion step
  server.app.get('/auth/twitter/details', (req, res) => {
    if (req.user) {
      return res.redirect('/api/session');
    }

    res.send(`
        <form action="/auth/twitter/complete" method="post">
          <input type="text" placeholder="name" name="name" />
          <button type="submit">Submit</button>
        </form>
      `);
  });

  // Gets the name and creates a new User
  server.app.post(
    '/auth/twitter/complete',
    server.express.urlencoded({ extended: true }),
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
        await keystone.sessionManager.startAuthedSession(req, { item, list });
        res.redirect('/api/session');
      } catch (createError) {
        next(createError);
      }
    }
  );
};
