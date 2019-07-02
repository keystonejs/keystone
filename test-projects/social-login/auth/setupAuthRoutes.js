const { startAuthedSession } = require('@keystone-alpha/session');
const express = require('express');

const { cookieSecret } = require('../config');

module.exports = ({
  strategy,
  app,
  authRoot = '/auth',
  successRedirect = '/api/session',
  failureRedirect = '/',
  audiences = ['admin'],
}) => {
  const basePath = `${authRoot}/${strategy.authType}`;
  // Hit this route to start the auth process for service
  app.get(
    basePath,
    strategy.loginMiddleware({
      // If not set, will just call `next()`
      sessionExists: (itemId, req, res) => {
        console.log(`Already logged in as ${itemId} 🎉`);
        // logged in already? Send 'em home!
        return res.redirect(successRedirect);
      },
    })
  );

  // oAuth service will redirect the user to this URL after approval.
  app.get(
    `${basePath}/callback`,
    strategy.authenticateMiddleware({
      verified: async (item, { list }, req, res) => {
        // You could try and find user by email address here to match users
        // if you get the email data back from auth service, then refer to
        // connectItem, for example:
        // await keystone.auth[<User list>][strategy.authType].connectItem(req, { item });
        // ...

        // If we don't have a matching user in our system, force redirect to
        // the create step
        if (!item) {
          return res.redirect(`${basePath}/create`);
        }

        // Otherwise create a session based on the user we have already
        await startAuthedSession(req, { item, list }, audiences, cookieSecret);
        // Redirect on sign in
        res.redirect(successRedirect);
      },
      failedVerification: (error, req, res) => {
        console.log(`Failed to verify ${strategy.authType} login creds`);
        res.redirect(failureRedirect);
      },
    })
  );

  // Sample page to collect a name, submits to the completion step which will
  // create a user
  app.get(`${basePath}/create`, (req, res) => {
    // Redirect if we're already signed in
    if (req.user) {
      return res.redirect(successRedirect);
    }
    // If we don't have a keystone[serviceName]SessionId (strategy.config.keystoneSessionIdField) at this point, the form
    // submission will fail, so fail out to the first step
    if (!req.session[strategy.config.keystoneSessionIdField]) {
      return res.redirect(basePath);
    }

    res.send(`
      <form action="${basePath}/complete" method="post">
        <input type="text" placeholder="name" name="name" />
        <button type="submit">Submit</button>
      </form>
    `);
  });

  // Gets the name and creates a new User
  app.post(
    `${basePath}/complete`,
    express.urlencoded({ extended: true }),
    async (req, res, next) => {
      // Redirect if we're already signed in
      if (req.user) {
        return res.redirect(successRedirect);
      }

      // Create a new User
      try {
        const list = strategy.getList();

        const item = await strategy.keystone.createItem(list.key, {
          name: req.body.name,
        });

        await strategy.connectItem(req, { item });
        await startAuthedSession(req, { item, list }, audiences, cookieSecret);
        res.redirect(successRedirect);
      } catch (createError) {
        next(createError);
      }
    }
  );
};
