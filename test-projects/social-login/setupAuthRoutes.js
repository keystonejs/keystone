const { startAuthedSession } = require('@keystone-alpha/session');

module.exports = strategy => {
  // Hit this route to start the auth process for service
  strategy.config.server.app.get(
    `/${strategy.config.authRoot}/${strategy.authType}`,
    strategy.loginMiddleware({
      // If not set, will just call `next()`
      sessionExists: (itemId, req, res) => {
        console.log(`Already logged in as ${itemId} 🎉`);
        // logged in already? Send 'em home!
        return res.redirect(strategy.config.authSuccessRedirect);
      },
    })
  );

  // oAuth service will redirect the user to this URL after approval.
  strategy.config.server.app.get(
    `/${strategy.config.authRoot}/${strategy.authType}/callback`,
    strategy.authenticateMiddleware({
      verified: async (item, { list }, req, res) => {
        // You could try and find user by email address here to match users
        // if you get the email data back from auth service, then refer to
        // connectItem, for example:
        // await keystone.auth.User[strategy.authType].connectItem(req, { item });
        // ...

        // If we don't have a matching user in our system, force redirect to
        // the create step
        if (!item) {
          return res.redirect(`/${strategy.config.authRoot}/${strategy.authType}/create`);
        }

        // Otherwise create a session based on the user we have already
        await startAuthedSession(req, { item, list });
        // Redirect on sign in
        res.redirect(strategy.config.authSuccessRedirect);
      },
      failedVerification: (error, req, res) => {
        console.log(`Failed to verify ${strategy.authType} login creds`);
        res.redirect(strategy.config.authFailureRedirect);
      },
    })
  );

  // Sample page to collect a name, submits to the completion step which will
  // create a user
  strategy.config.server.app.get(
    `/${strategy.config.authRoot}/${strategy.authType}/create`,
    (req, res) => {
      // Redirect if we're already signed in
      if (req.user) {
        return res.redirect(strategy.config.authSuccessRedirect);
      }
      // If we don't have a keystone[serviceName]SessionId (strategy.config.keystoneSessionIdField) at this point, the form
      // submission will fail, so fail out to the first step
      if (!req.session[strategy.config.keystoneSessionIdField]) {
        return res.redirect(`/${strategy.config.authRoot}/${strategy.authType}`);
      }

      res.send(`
      <form action="/${strategy.config.authRoot}/_/complete" method="post">
        <input type="text" placeholder="name" name="name" />
        <button type="submit">Submit</button>
      </form>
    `);
    }
  );

  // Gets the name and creates a new User
  strategy.config.server.app.post(
    `/${strategy.config.authRoot}/${strategy.authType}/complete`,
    strategy.config.server.express.urlencoded({ extended: true }),
    async (req, res, next) => {
      // Redirect if we're already signed in
      if (req.user) {
        return res.redirect(strategy.config.authSuccessRedirect);
      }

      // Create a new User
      try {
        const list = strategy.getList();

        const item = await strategy.keystone.createItem(list.key, {
          name: req.body.name,
        });

        await strategy.keystone.auth.User[strategy.authType].connectItem(req, { item });
        await startAuthedSession(req, { item, list });
        res.redirect(strategy.config.authSuccessRedirect);
      } catch (createError) {
        next(createError);
      }
    }
  );
};
