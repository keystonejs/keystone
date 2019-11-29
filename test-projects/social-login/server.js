const express = require('express');
const cookieParser = require('cookie-parser');

const { keystone, apps, googleStrategy } = require('./index');
const { port } = require('./config');
const initialData = require('./data');

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
      await keystone.createItems(initialData);
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
        (str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/"/g, '&quot;');

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
      await keystone.createItems(initialData);
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
