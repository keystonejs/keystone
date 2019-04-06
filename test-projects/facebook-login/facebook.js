const { FacebookAuthStrategy } = require('@keystone-alpha/keystone');
const { startAuthedSession, endAuthedSession } = require('@keystone-alpha/session');

const { appURL, facebookAppKey, facebookAppSecret } = require('./config');

exports.configureFacebookAuth = function(keystone, server) {
  const facebookAuth = keystone.createAuthStrategy({
    type: FacebookAuthStrategy,
    list: 'User',
    config: {
      consumerKey: facebookAppKey,
      consumerSecret: facebookAppSecret,
      callbackURL: `${appURL}/auth/facebook/callback`,
      idField: 'facebookId',
      usernameField: 'facebookUsername',
      server,
    },
  });

  // Hit this route to start the facebook auth process
  server.app.get(
    '/auth/facebook',
    facebookAuth.loginMiddleware({
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

  server.app.get('/api/signout', async (req, res, next) => {
    try {
      await endAuthedSession(req);
      res.json({
        success: true,
      });
    } catch (e) {
      next(e);
    }
  });

  // Facebook will redirect the user to this URL after approval.
  server.app.get(
    '/auth/facebook/callback',
    facebookAuth.authenticateMiddleware({
      async verified(item, { list }, req, res) {
        // You could try and find user by email address here to match users
        // if you get the email data back from Facebook, then refer to
        // connectItem, for example:
        // await keystone.auth.User.facebook.connectItem(req, { item });
        // ...

        // If we don't have a matching user in our system, force redirect to
        // the create step
        if (!item) {
          return res.redirect('/auth/facebook/create');
        }

        // Otheriwse create a session based on the user we have already
        await startAuthedSession(req, { item, list });
        // Redirect on sign in
        res.redirect('/api/session');
      },
      failedVerification(error, req, res) {
        console.log('Failed to verify Facebook login creds');
        res.redirect('/');
      },
    })
  );

  // Sample page to collect a name, submits to the completion step which will
  // create a user
  server.app.get('/auth/facebook/create', (req, res) => {
    // Redirect if we're already signed in
    if (req.user) {
      return res.redirect('/api/session');
    }
    // If we don't have a keystoneFacebookSessionId at this point, the form
    // submission will fail, so fail out to the first step
    if (!req.session.keystoneFacebookSessionId) {
      return res.redirect('/auth/facebook');
    }

    res.send(`
        <form action="/auth/facebook/complete" method="post">
          <input type="text" placeholder="name" name="name" />
          <button type="submit">Submit</button>
        </form>
      `);
  });

  // Gets the name and creates a new User
  server.app.post(
    '/auth/facebook/complete',
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

        await keystone.auth.User.facebook.connectItem(req, { item });
        await startAuthedSession(req, { item, list });
        res.redirect('/api/session');
      } catch (createError) {
        next(createError);
      }
    }
  );
};
