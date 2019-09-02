<!--[meta]
section: api
subSection: authentication-strategies
title: Passport Auth Strategy
[meta]-->

# Passport Auth Strategy

Enable KeystoneJS authentication via services such as Google, Twitter, Facebook,
GitHub, and any [others supported by `passport.js`](passportjs.org/packages/).

## Authentication Flows

This package enables three authentication flows;

1. Single Step Account Creation & Authentication
2. Multi Step Account Creation & Authentication
3. Existing Account Authentication

### Single Step Account Creation & Authentication

When creating a new account in KeystoneJS, the service (Google, Twitter, etc)
provides some basic user information such as name and, if enabled, email. Often
this information alone is enough to create a new KeystoneJS account, so it is
the default authentication flow known as _Single Step Account Creation_.

For example, when logging in with Google, the user will;

- Click "Login with Google"
- Be redirected to google.com's authentication page if not already logged in
- Be asked to grant permission for your KeystoneJS app
- Be redirected to your application's _callback_ URL
- This package will create a new account & authenticate the user, then trigger
  `onAuthenticated({ token, item, isNewItem })` with `isNewItem = true` (see [the API
  docs below](#api))

### Multi Step Account Creation & Authentication

Sometimes the information provided by the service is not enough to create a new
account in KeystoneJS. For example, your application may require the user's age,
or want to confirm the email address provided by the service.

The [default Single Step Flow](#single-step-account-creation-authentication) can
be extended to _pause_ account creation while we gather the extra information
from the user. Pausing even works across page refreshes. This is known as _Multi
Step Account Creation_.

For example, when logging in with Google, the user will _(differences from [the
Single Step Flow](#single-step-account-creation-authentication) are bolded)_:

- Click "Login with Google"
- Be redirected to google.com's authentication page if not already logged in
- Be asked to grant permission for your KeystoneJS app
- Be redirected to your application's _callback_ URL
- **Be redirected to a form to gather more information**
- **Submit the form which will resume account creation & authentication**
- This package will create a new account & authenticate the user, then trigger
  `onAuthenticated({ token, item, isNewItem })` with `isNewItem = true` (see [the API
  docs below](#api))

### Existing Account Authentication

When a user has previously created an account via a given service, this package
will use information stored in the `idField` (see [the API docs below](#api)) to
match the account and authenticate them:

- Click "Login with Google"
- Be redirected to google.com's authentication page if not already logged in
- Be redirected to your application's _callback_ URL
- This package will authenticate the existing user, then trigger
  `onAuthenticated({ token, item, isNewItem })` with `isNewItem = false` (see
  [the API docs below](#api))

## API

<!-- TODO -->

## Usage

### Single Step With Google

_NOTE: The below can be done with any of the supported strategies (Twitter,
Facebook, etc)._

To run this example: `keystone dev`, then visit
`http://localhost:3000/auth/google` to start the Google authentication process.

`index.js`

```javascript
const { Keystone } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');

const { GoogleAuthStrategy } = require('@keystone-alpha/auth-passport');

const cookieSecret = '<Something super secret>';

const keystone = new Keystone({
  name: 'Login With Google Example',
  adapter: new MongooseAdapter(),
  cookieSecret,
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },

    // This field name must match the `idField` setting passed to the auth
    // strategy constructor below
    googleId: { type: Text },
  },
});

const googleStrategy = keystone.createAuthStrategy({
  type: GoogleAuthStrategy,
  list: 'User',
  config: {
    idField: 'googleId',
    appId: '<Your Google App Id>',
    appSecret: '<Your Google App Secret>',
    loginPath: '/auth/google',
    callbackPath: '/auth/google/callback',

    // Once a user is found/created and successfully matched to the
    // googleId, they are authenticated, and the token is returned here.
    // NOTE: By default KeystoneJS sets a `keystone.sid` which authenticates the
    // user for the API domain. If you want to authenticate via another domain,
    // you must pass the `token` as a Bearer Token to GraphQL requests.
    onAuthenticated: ({ token, item, isNewItem }, req, res) => {
      console.log(token);
      res.redirect('/');
    },

    // If there was an error during any of the authentication flow, this
    // callback is executed
    onError: (error, req, res) => {
      console.error(error);
      res.redirect('/?error=Uh-oh');
    },
  },
});

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp()],
};
```

### Multi Step With Google

_NOTE: The below can be done with any of the supported strategies (Twitter,
Facebook, etc)._

Due to the extra route used for gathering the user's name, this example
implements [an All-in-one Custom
Server](/guides/custom-server#all-in-one-custom-server) and should be run
with `node server.js`, then visit `http://localhost:3000/auth/google` to start
the Google authentication process.

`server.js`

```javascript
const { Keystone } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const express = require('express');

const { GoogleAuthStrategy } = require('@keystone-alpha/auth-passport');

const cookieSecret = '<Something super secret>';

const keystone = new Keystone({
  name: 'Login With Google Example',
  adapter: new MongooseAdapter(),
  cookieSecret,
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },

    // This field name must match the `idField` setting passed to the auth
    // strategy constructor below
    googleId: { type: Text },
  },
});

const googleStrategy = keystone.createAuthStrategy({
  type: GoogleAuthStrategy,
  list: 'User',
  config: {
    idField: 'googleId',
    appId: '<Your Google App Id>',
    appSecret: '<Your Google App Secret>',
    loginPath: '/auth/google',
    callbackPath: '/auth/google/callback',

    loginPathMiddleware: (req, res, next) => {
      // An express middleware executed before the Passport social signin flow
      // begins. Useful for setting cookies, etc.
      // Don't forget to call `next()`!
      next();
    },

    callbackPathMiddleware: (req, res, next) => {
      // An express middleware executed before the callback route is run. Useful
      // for logging, etc.
      // Don't forget to call `next()`!
      next();
    },

    // Called when there's no existing user for the given googleId
    // Default: resolveCreateData: () => ({})
    resolveCreateData: ({ createData, actions: { pauseAuthentication } }, req, res) => {
      // If we don't have the right data to continue with a creation
      if (!createData.name) {
        // then we pause the flow
        pauseAuthentication();
        // And redirect the user to a page where they can enter the data.
        // Later, the `resolveCreateData()` method will be re-executed this
        // time with the complete data.
        res.redirect(`/auth/google/step-2`);
        return;
      }

      return createData;
    },

    // Once a user is found/created and successfully matched to the
    // googleId, they are authenticated, and the token is returned here.
    // NOTE: By default KeystoneJS sets a `keystone.sid` which authenticates the
    // user for the API domain. If you want to authenticate via another domain,
    // you must pass the `token` as a Bearer Token to GraphQL requests.
    onAuthenticated: ({ token, item, isNewItem }, req, res) => {
      console.log(token);
      res.redirect('/');
    },

    // If there was an error during any of the authentication flow, this
    // callback is executed
    onError: (error, req, res) => {
      console.error(error);
      res.redirect('/?error=Uh-oh');
    },
  },
});

keystone
  .prepare({
    apps: [new GraphQLApp(), new AdminUIApp()],
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    const app = express();
    app.use(middlewares);

    // Sample page to collect a name, submits to the completion step which will
    // create a user
    app.use(`/auth/google/step-2`, express.urlencoded({ extended: true }), (req, res, next) => {
      if (req.method === 'POST') {
        const { name } = req.body;
        // Continue the authentication flow with additional data the user
        // submitted.
        // This data is merged into other data required by Keystone and will
        // trigger the resolveCreateData() method again.
        return googleStrategy.resumeAuthentication({ name }, req, res, next);
      }

      res.send(`
          <form method="post">
            <label>
              What is your name? <input type="text" name="name" />
            </label>
            <button type="submit">Submit</button>
          </form>
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
```

## Using other PassportJs Strategies

You can create your own strategies to work with KeystoneJS by extending the
`PassportAuthStrategy` class:

```javascript
const PassportWordPress = require('passport-wordpress').Strategy;
const { PassportAuthStrategy } = require('@keystone-alpha/auth-passport');

class WordPressAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(WordPressAuthStrategy.authType, keystone, listKey, config, PassportWordPress);
  }
}

WordPressAuthStrategy.authType = 'wordpress';

module.exports = WordPressAuthStrategy;
```
