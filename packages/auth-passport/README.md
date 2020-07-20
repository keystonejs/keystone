<!--[meta]
section: api
subSection: authentication-strategies
title: Passport auth strategy
[meta]-->

# Passport auth strategy

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/auth-passport)

> This feature is currently in progress. While passport works for the `GraphQLApp`, only password authentication is supported for the `AdminUIApp`. Please see [this issue](https://github.com/keystonejs/keystone/issues/2581) for more details.

Enable Keystone authentication via services such as Google, Twitter, Facebook,
GitHub, and any [others supported by passport.js](http://www.passportjs.org).

## Authentication flows

This package enables three authentication flows;

1. Single Step Account Creation & Authentication
2. Multi Step Account Creation & Authentication
3. Existing Account Authentication

### Single-step account creation and authentication

When creating a new account in Keystone, the service (Google, Twitter, etc)
provides some basic user information such as name and, if enabled, email. Often
this information alone is enough to create a new Keystone account, so it is
the default authentication flow known as _Single Step Account Creation_.

For example, when logging in with Google, the user will;

- Click "Login with Google"
- Be redirected to google.com's authentication page if not already logged in
- Be asked to grant permission for your Keystone app
- Be redirected to your application's _callback_ URL
- This package will create a new account & authenticate the user, then trigger
  `onAuthenticated({ token, item, isNewItem })` with `isNewItem = true` (see [the API
  docs below](#api))

### Multi-step account creation and authentication

Sometimes the information provided by the service is not enough to create a new
account in Keystone. For example, your application may require the user's age,
or want to confirm the email address provided by the service.

The [default Single Step Flow](#single-step-account-creation-and-authentication) can
be extended to _pause_ account creation while we gather the extra information
from the user. Pausing even works across page refreshes. This is known as _Multi
Step Account Creation_.

For example, when logging in with Google, the user will _(differences from [the
Single Step Flow](#single-step-account-creation-and-authentication) are bolded)_:

- Click "Login with Google"
- Be redirected to google.com's authentication page if not already logged in
- Be asked to grant permission for your Keystone app
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

The API needs documentation.

## Usage

### Single-step with google

> **Note:** The documentation below applies to any of the supported strategies (Twitter, Facebook, etc)

To run this example: `keystone dev`, then visit
`http://localhost:3000/auth/google` to start the Google authentication process.

`index.js`

```javascript
const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

const { GoogleAuthStrategy } = require('@keystonejs/auth-passport');

const cookieSecret = '<Something super secret>';

const keystone = new Keystone({
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
    callbackHost: 'http://localhost:3000',

    // Once a user is found/created and successfully matched to the
    // googleId, they are authenticated, and the token is returned here.
    // NOTE: By default Keystone sets a `keystone.sid` which authenticates the
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
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: 'Login With Google Example',
      authStrategy: googleStrategy,
    }),
  ],
};
```

### Multi-step with google

> **Note:** The documentation below applies to any of the supported strategies (Twitter, Facebook, etc)

Due to the extra route used for gathering the user's name, this example implements
[an All-in-one Custom Server](/docs/guides/custom-server.md#all-in-one-custom-server)
and should be run with `node server.js`, then visit `http://localhost:3000/auth/google` to start
the Google authentication process.

`server.js`

```javascript
const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const express = require('express');

const { GoogleAuthStrategy } = require('@keystonejs/auth-passport');

const cookieSecret = '<Something super secret>';

const keystone = new Keystone({
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
    callbackHost: 'http://localhost:3000',

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
    // NOTE: By default Keystone sets a `keystone.sid` which authenticates the
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
    apps: [
      new GraphQLApp(),
      new AdminUIApp({
        name: 'Login With Google Example',
        authStrategy: googleStrategy,
      }),
    ],
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

Sometimes you just need to get the profile data provided by the auth provider. In that case, you
have to call the `resolveCreateData` with `serviceProfile` property. See an example below:

```javascript
// Here we wait for our serviceProfile to get the data provided by the auth provider
resolveCreateData: ({ createData, serviceProfile }) => {
  // Once we had our seviceProfile, we set it on our list fields

  // Google will return the profile data inside the _json key
  // Each provider can return the user profile data in a different way.
  // Check how it's returned on your provider documentation
  createData.name = serviceProfile._json.name;
  createData.profilePicture = serviceProfile._json.picture;

  return createData;
};
```

## Using other Passport strategies

You can create your own strategies to work with Keystone by extending the
`PassportAuthStrategy` class:

```javascript
const PassportWordPress = require('passport-wordpress').Strategy;
const { PassportAuthStrategy } = require('@keystonejs/auth-passport');

class WordPressAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(WordPressAuthStrategy.authType, keystone, listKey, config, PassportWordPress);
  }
}

WordPressAuthStrategy.authType = 'wordpress';

module.exports = WordPressAuthStrategy;
```
