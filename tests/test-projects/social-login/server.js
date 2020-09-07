const express = require('express');
const cookieParser = require('cookie-parser');
const {
  GoogleAuthStrategy,
  FacebookAuthStrategy,
  TwitterAuthStrategy,
  GitHubAuthStrategy,
} = require('@keystonejs/auth-passport');
const { createItems } = require('@keystonejs/server-side-graphql-client');

const { keystone, apps } = require('./index');
const { google, facebook, twitter, github, port } = require('./config');
const initialData = require('./data');

let googleStrategy;
if (google) {
  googleStrategy = keystone.createAuthStrategy({
    type: GoogleAuthStrategy,
    list: 'User',
    config: {
      idField: 'googleId',
      appId: google.appId,
      appSecret: google.appSecret,
      loginPath: '/auth/google',
      callbackPath: '/auth/google/callback',

      loginPathMiddleware: (req, res, next) => {
        // Pull redirect URLs off of the query string
        const { successRedirect = '/profile', failureRedirect = '/' } = req.query || {};
        // Store them in a cookie so we can access them again later
        res.cookie('redirects', JSON.stringify({ successRedirect, failureRedirect }));
        // Continue with social authing
        next();
      },

      callbackPathMiddleware: (req, res, next) => {
        console.log('Google callback URL fired');
        next();
      },

      // Called when there's no existing user for the given googleId
      // Default: resolveCreateData: () => ({})
      resolveCreateData: (
        { createData, serviceProfile, actions: { pauseAuthentication } },
        req,
        res
      ) => {
        // If we don't have the right data to continue with a creation
        if (!createData.email) {
          // then we pause the flow
          pauseAuthentication();
          const { emails: [{ value: email = '' } = {}] = [] } = serviceProfile;
          // And redirect the user to a page where they can enter the data.
          // Later, the `resolveCreateData()` method will be re-executed this
          // time with the complete data.
          res.redirect(
            `/auth/google/step-2?email=${encodeURIComponent(email)}&authType=${
              GoogleAuthStrategy.authType
            }`
          );
          return;
        }

        return createData;
      },

      // Once a user is found/created and successfully matched to the
      // googleId, they are authenticated, and the token is returned here.
      onAuthenticated: (tokenAndItem, req, res) => {
        console.log(tokenAndItem);
        // Grab the redirection target from the cookie set earlier
        const redirectTo = JSON.parse(req.cookies.redirects).successRedirect;
        // And redirect there
        // NOTE: You should probabaly do some safety checks here for a valid URL
        // and/or ensure it's a relative URL to avoid phising attacks.
        res.redirect(redirectTo);
      },

      // If there was an error during any of the authentication flow, this
      // callback is executed
      onError: (error, req, res) => {
        console.error(error);
        // Grab the redirection target from the cookie set earlier
        const redirectTo = JSON.parse(req.cookies.redirects).failureRedirect;
        // And redirect there
        // NOTE: You should probabaly do some safety checks here for a valid URL
        // and/or ensure it's a relative URL to avoid phising attacks.
        res.redirect(
          `${redirectTo}?error=${encodeURIComponent(error.message || error.toString())}`
        );
      },
    },
  });
}

if (facebook) {
  keystone.createAuthStrategy({
    type: FacebookAuthStrategy,
    list: 'User',
    config: {
      idField: 'facebookId',
      appId: facebook.appId,
      appSecret: facebook.appSecret,
      loginPath: '/auth/facebook',
      callbackPath: '/auth/facebook/callback',
      // Called when there's no existing user for the given googleId
      // Default: resolveCreateData: () => ({})
      resolveCreateData: ({ createData, serviceProfile }) => {
        // If we don't have the right data to continue with a creation
        if (!createData.email) {
          const { emails: [{ value: email = '' } = {}] = [] } = serviceProfile;
          if (email) {
            createData.email = email;
          }
        }

        return createData;
      },

      // Once a user is found/created and successfully matched to the
      // googleId, they are authenticated, and the token is returned here.
      onAuthenticated: (tokenAndItem, req, res) => {
        console.log(tokenAndItem);
        res.redirect('/profile');
      },

      // If there was an error during any of the authentication flow, this
      // callback is executed
      onError: (error, req, res) => {
        console.error(error);
        res.redirect(`/?error=${encodeURIComponent(error.message || error.toString())}`);
      },
    },
  });
}

if (twitter) {
  keystone.createAuthStrategy({
    type: TwitterAuthStrategy,
    list: 'User',
    config: {
      idField: 'twitterId',
      appId: twitter.appId,
      appSecret: twitter.appSecret,
      loginPath: '/auth/twitter',
      callbackPath: '/auth/twitter/callback',
      resolveCreateData: ({ createData, serviceProfile }) => {
        if (!createData.email) {
          const { emails: [{ value: email = '' } = {}] = [] } = serviceProfile;
          if (email) {
            createData.email = email;
          }
        }
        return createData;
      },
      onAuthenticated: (tokenAndItem, req, res) => res.redirect('/profile'),
      onError: (error, req, res) => {
        console.error(error);
        res.redirect(`/?error=${encodeURIComponent(error.message || error.toString())}`);
      },
    },
  });
}

if (github) {
  keystone.createAuthStrategy({
    type: GitHubAuthStrategy,
    list: 'User',
    config: {
      idField: 'githubId',
      appId: github.appId,
      appSecret: github.appSecret,
      loginPath: '/auth/github',
      callbackPath: '/auth/github/callback',
      resolveCreateData: ({ createData, serviceProfile }) => {
        if (!createData.email) {
          const { emails: [{ value: email = '' } = {}] = [] } = serviceProfile;
          if (email) {
            createData.email = email;
          }
        }
        return createData;
      },
      onAuthenticated: (tokenAndItem, req, res) => res.redirect('/profile'),
      onError: (error, req, res) => {
        console.error(error);
        res.redirect(`/?error=${encodeURIComponent(error.message || error.toString())}`);
      },
    },
  });
}

keystone
  .prepare({
    apps,
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    await keystone.connect();

    // Initialise some data.
    // NOTE: This is only for test purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await createItems({
        keystone,
        listKey: 'User',
        items: initialData.User.map(x => ({ data: x })),
      });
    }

    const app = express();

    app.use(cookieParser());
    app.use(middlewares);

    // Sample page to collect a name, submits to the completion step which will
    // create a user
    app.use(`/auth/google/step-2`, express.urlencoded({ extended: true }), (req, res, next) => {
      if (req.method === 'POST') {
        // Continue the authentication flow with additional data the user
        // submitted.
        // This data is merged into other data required by Keystone and will
        // trigger the resolveCreateData() method again.
        return googleStrategy.resumeAuthentication({ email: req.body.email }, req, res, next);
      }

      const escapeHtml = str =>
        (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

      res.send(`
          <form method="post">
            <label>
              What is your email?<br />
              <input type="email" placeholder="email" name="email" value="${escapeHtml(
                req.query.email
              )}" />
            </label>
            <button type="submit">Submit</button>
            <input type="hidden" name="authType" value="${escapeHtml(req.query.authType)}" />
          </form>
        `);
    });

    app.get('/reset-db', async (req, res) => {
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      for (const [listKey, _items] of Object.entries(initialData)) {
        await createItems({
          keystone,
          listKey,
          items: _items.map(x => ({ data: x })),
        });
      }
      res.redirect('/admin');
    });

    app.get('/profile', async (req, res) => {
      res.send(`
        <pre>Loading...</pre>
        <script>
          fetch('/admin/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{ "query": "{ authenticatedUser { id name email facebookId googleId twitterId githubId } }" }',
          })
          .then(x => x.json())
          .then(({ data }) => {
            document.querySelector('pre').innerText = JSON.stringify(data.authenticatedUser, null, 2);
          });
        </script>
      `);
    });

    app.get('/logout', async (req, res) => {
      res.send(`
        <div>Logging out...</div>
        <script>
          fetch('/admin/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{ "query": "mutation { unauthenticateUser { success } }" }',
          })
          .then(x => x.json())
          .then(({ data }) => {
            document.querySelector('div').innerText = 'You have been logged out.';
          });
        </script>
      `);
    });

    app.get('/', (req, res) => {
      res.send(`
        <html>
          <a href="/auth/google?successRedirect=${encodeURIComponent(
            '/profile?loggedInWithGoogle'
          )}">
            Login With Google
          </a> <em>(multi-step)</em><br />
          <a href="/auth/facebook">Login With Facebook</a> <em>(single-step)</em><br />
          <a href="/auth/twitter">Login With Twitter</a> <em>(single-step)</em><br />
          <a href="/auth/github">Login With GitHub</a> <em>(single-step)</em><br />
        </html>
      `);
    });

    app.listen(port, error => {
      if (error) throw error;
      console.log(`Ready. App available at http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
