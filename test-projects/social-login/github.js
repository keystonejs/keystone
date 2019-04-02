const GitHubAuthStrategy = require('@keystone-alpha/keystone/auth/GitHub');
const { startAuthedSession } = require('@keystone-alpha/session');

const { appURL, githubAppKey, githubAppSecret } = require('./config');

exports.configureGitHubAuth = function(keystone, server) {
  const githubAuth = keystone.createAuthStrategy({
    type: GitHubAuthStrategy,
    list: 'User',
    config: {
      consumerKey: githubAppKey,
      consumerSecret: githubAppSecret,
      callbackURL: `${appURL}/auth/github/callback`,
      // idField: 'githubId',
      // usernameField: 'githubUsername',
      server,
    },
  });

  // Hit this route to start the github auth process
  server.app.get(
    '/auth/github',
    githubAuth.loginMiddleware({
      // If not set, will just call `next()`
      sessionExists: (itemId, req, res) => {
        console.log(`Already logged in as ${itemId} 🎉`);
        // logged in already? Send 'em home!
        return res.redirect('/api/session');
      },
    })
  );

  // GitHub will redirect the user to this URL after approval.
  server.app.get(
    '/auth/github/callback',
    githubAuth.authenticateMiddleware({
      async verified(item, { list }, req, res) {
        // You could try and find user by email address here to match users
        // if you get the email data back from GitHub, then refer to
        // connectItem, for example:
        // await keystone.auth.User.github.connectItem(req, { item });
        // ...

        // If we don't have a matching user in our system, force redirect to
        // the create step
        if (!item) {
          return res.redirect('/auth/github/create');
        }

        // Otheriwse create a session based on the user we have already
        await startAuthedSession(req, { item, list });
        // Redirect on sign in
        res.redirect('/api/session');
      },
      failedVerification(error, req, res) {
        console.log('Failed to verify GitHub login creds');
        res.redirect('/');
      },
    })
  );

  // Sample page to collect a name, submits to the completion step which will
  // create a user
  server.app.get('/auth/github/create', (req, res) => {
    // Redirect if we're already signed in
    if (req.user) {
      return res.redirect('/api/session');
    }
    // If we don't have a keystoneGitHubSessionId at this point, the form
    // submission will fail, so fail out to the first step
    if (!req.session.keystoneGitHubSessionId) {
      return res.redirect('/auth/github');
    }

    res.send(`
        <form action="/auth/github/complete" method="post">
          <input type="text" placeholder="name" name="name" />
          <button type="submit">Submit</button>
        </form>
      `);
  });

  // Gets the name and creates a new User
  server.app.post(
    '/auth/github/complete',
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

        await keystone.auth.User.github.connectItem(req, { item });
        await startAuthedSession(req, { item, list });
        res.redirect('/api/session');
      } catch (createError) {
        next(createError);
      }
    }
  );
};
