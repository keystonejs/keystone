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
        // You could try and find user by email address here to match users
        // if you get the email data back from Twitter, then refer to
        // connectItem, for example:
        // await keystone.auth.User.twitter.connectItem(req, { item });
        // ...

        // If we don't have a matching user in our system, force redirect to
        // the create step
        if (!item) {
          return res.redirect('/auth/twitter/create');
        }
        await keystone.sessionManager.startAuthedSession(req, { item, list });
        res.redirect('/api/session');
      },
      failedVerification(error, req, res) {
        console.log('Failed to verify Twitter login creds');
        res.redirect('/');
      },
    })
  );

  // Sample page to collect a name, submits to the completion step which will
  // create a user
  server.app.get('/auth/twitter/create', (req, res) => {
    // Redirect if we're already signed in
    if (req.user) {
      return res.redirect('/api/session');
    }
    // If we don't have a keystoneTwitterSessionId at this point, the form
    // submission will fail, so fail out to the first step
    if (!req.session.keystoneTwitterSessionId) {
      return res.redirect('/auth/twitter');
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
      // Redirect if we're already signed in
      if (req.user) {
        return res.redirect('/api/session');
      }

      // Create a new User
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
