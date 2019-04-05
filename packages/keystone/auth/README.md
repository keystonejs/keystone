---
section: packages
title: Authentication Strategies
---

# Authentication Strategies

When calling `keystone.createAuthStrategy()` you must supply specify the auth strategy to be used
by supplying it's class.

Below are the currently supported auth strategy types.

## Password

Authenticates party (often a user) based on their presentation of a credential pair.
The credential pair consists of an identifier and a secret (often an email address and password).

### Usage

Assuming a list of users such as:

```js
keystone.createList('User', {
  fields: {
    username: { type: Text },
    password: { type: Password },
    // Other fields ..
  },
});
```

We can configure the Keystone auth strategy as:

```js
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {
    identityField: 'username',
    secretField: 'password',
  },
});
```

Later, the admin UI authentication handler will do something like this:

```js
app.post('/admin/signin', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const result = await this.authStrategy.validate({
    identity: username,
    secret: password,
  });

  if (result.success) {
    // Create session and redirect
    // ..
  }

  // Return the failure
  return res.json({ success: false, message: result.message });
});
```

### Config

| Option              | Type      | Default    | Description                                                               |
| ------------------- | --------- | ---------- | ------------------------------------------------------------------------- |
| `identity`          | `String`  | `email`    | The field `path` for values that uniquely identifies items                |
| `secret`            | `String`  | `password` | The field `path` for secret values known only to the authenticating party |
| `protectIdentities` | `Boolean` | `false`    | Protect identities at the expense of usability                            |

#### `identity`

The field `path` for values that _uniquely_ identifies items.
For human actors this is usually a field that contains usernames or email addresses.
For automated access, the `id` may be appropriate.

#### `secret`

The field `path` for secret values known only to the authenticating party.
The type used by this field must expose a comparison function with the signature
`compare(candidateValue, storedValue)` where:

- `candidateValue` is the (plaintext) value supplied by the actor attempting to authenticate
- `storedValue` is a value stored by the field on an item (usually a hash)

The build in `Password` field type fulfils this requirements.

#### `protectIdentities`

Generally, Keystone strives to provide users with detailed error messages.
In the context of authentication this is often not desirable.
Information about existing accounts can inadvertently leaked to malicious actors.

When `protectIdentities` is `false`,
authentication attempts will return helpful messages with known keys:

- `[passwordAuth:identity:notFound]`
- `[passwordAuth:identity:multipleFound]`
- `[passwordAuth:secret:mismatch]`

As a user, this can be useful to know and indicating these different condition in
the UI increases usability.
However, it also exposes information about existing accounts.
A malicious actor can use this behaviour to _verify_ account identities making further attacks easier.
Since identity values are often email addresses or based on peoples names (eg. usernames),
verifying account identities can also expose personal data outright.

When `protectIdentities` is `true` these error messages and keys are suppressed.
Responses to failed authentication attempts contain only a generic message and key:

- `[passwordAuth:failure]`

This aligns with the Open Web Application Security Project (OWASP)
[authentication guidelines](https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Authentication_Responses)
which state:

> An application should respond with a generic error message regardless of whether the user ID or password was incorrect.
> It should also give no indication to the status of an existing account.

Efforts are also taken to protect against timing attacks.
The time spend verifying an actors credentials should be constant-time regardless of the reason for failure.

## Twitter

### Usage

#### 0-step new user creation

```javascript
const TwitterAuthStrategy = require('@keystone-alpha/keystone/auth/Twitter');

// before keystone.prepare()

const twitterAuth = keystone.createAuthStrategy({
  type: TwitterAuthStrategy,
  list: 'User',
  config: {
    consumerKey: process.env.TWITTER_APP_KEY,
    consumerSecret: process.env.TWITTER_APP_SECRET,
    callbackURL: `http://localhost:${PORT}/auth/twitter/callback`,
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

// Twitter will redirect the user to this URL after approval.
server.app.get(
  '/auth/twitter/callback',
  twitterAuth.authenticateMiddleware({
    async verified(item, info, req, res) {
      const authedItem = item || (await keystone.createItem(info.list.key, {}));

      try {
        await keystone.auth.User.twitter.connectItem(req, { item: authedItem });
        await keystone.sessionManager.startAuthedSession(req, {
          item: authedItem,
          list: info.list,
        });
      } catch (createError) {
        return res.json({
          success: false,
          // TODO: Better error
          error: createError.message || createError.toString(),
        });
      }

      res.redirect('/api/session');
    },
    failedVerification(error, req, res) {
      console.log('🤔 Failed to verify Twitter login creds');
      res.redirect('/');
    },
  })
);
```

#### Multi-step new user creation

eg; After giving permission to Twitter, we then want to ask for an email, an
address, their social security info, their mother's maiden name, and their
bank's password over multiple server requests / page refreshes:

```javascript
const TwitterAuthStrategy = require('@keystone-alpha/keystone/auth/Twitter');

// before keystone.prepare()

const twitterAuth = keystone.createAuthStrategy({
  type: TwitterAuthStrategy,
  list: 'User',
  config: {
    consumerKey: process.env.TWITTER_APP_KEY,
    consumerSecret: process.env.TWITTER_APP_SECRET,
    callbackURL: `http://localhost:${PORT}/auth/twitter/callback`,
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

// Twitter will redirect the user to this URL after approval.
server.app.get(
  '/auth/twitter/callback',
  twitterAuth.authenticateMiddleware({
    async verified(item, info, req, res) {
      // Twitter is verified, but we need some more details from the user
      if (!item) {
        return res.redirect('/auth/twitter/details');
      }

      res.redirect('/api/session');
    },
    failedVerification(error, req, res) {
      console.log('🤔 Failed to verify Twitter login creds');
      res.redirect('/');
    },
  })
);

server.app.get('/auth/twitter/details', (req, res) => {
  if (req.user) {
    return res.redirect('/api/session');
  }

  // Capture details somehow
  res.send(`
      <form action="/auth/twitter/complete" method="post">
        <input type="text" placeholder="name" name="name" />
        <button type="submit">Submit</button>
      </form>
    `);
});

server.app.use(server.express.urlencoded({ extended: true }));

server.app.post('/auth/twitter/complete', async (req, res, next) => {
  if (req.user) {
    return res.redirect('/api/session');
  }

  // Finally, we have all the info we need to create a new user and log that
  // user in
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
});
```

## Facebook, Google, GitHub
#### See Twitter Example

## Using other PassportJs Strategy

### Inherit from Keystone PassportAuthStrategy
```js
const PassportWordPress = require('passport-wordpress').Strategy;
const PassportAuthStrategy = require('@keystone-alpha/keystone/auth/Passport');

class WordPressAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(
      WordPressAuthStrategy.authType,
      keystone,
      listKey,
      {
        sessionIdField: 'wordpressSession',
        keystoneSessionIdField: 'keystoneWordPressSessionId',
        ...config,
      },
      PassportWordPress
    );
  }
}

WordPressAuthStrategy.authType = 'wordpress';

module.exports = WordPressAuthStrategy;
```

### Usage
Configure similar to Twitter Strategy

```js
// before keystone.prepare()

const wpAuth = keystone.createAuthStrategy({
  type: WordPressAuthStrategy,
  list: 'User',
  config: {
    consumerKey: process.env.WP_APP_KEY,
    consumerSecret: process.env.WP_APP_SECRET,
    callbackURL: `http://localhost:${PORT}/auth/wordpress/callback`,
    idField: 'wordpressId',
    usernameField: 'wordpressUsername',
    server,
  },
});
// rest of the code for configuring routes, similar to Twitter
```
