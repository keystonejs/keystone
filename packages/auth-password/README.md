<!--[meta]
section: api
subSection: authentication-strategies
title: Password auth strategy
order: 1
[meta]-->

# Password auth strategy

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/auth-password)

Authenticates a party (often a user) based on their presentation of a credential
pair. The credential pair consists of an identifier and a secret (often an email
address and password).

## Usage

Assuming a list of users such as:

```js
keystone.createList('User', {
  fields: {
    username: { type: Text },
    password: { type: Password },
  },
});
```

We can configure the KeystoneJS auth strategy as:

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

> **Note:** The auth strategy must be created after the User list.

Later, the admin UI authentication handler will do something like this:

```js
app.post('/admin/signin', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const result = await this.authStrategy.validate({
    username,
    password,
  });

  if (result.success) {
    // Create session and redirect
  }

  // Return the failure
  return res.json({ success: false, message: result.message });
});
```

## Config

| Option              | Type      | Default    | Description                                                               |
| ------------------- | --------- | ---------- | ------------------------------------------------------------------------- |
| `identityField`     | `String`  | `email`    | The field `path` for values that uniquely identifies items                |
| `secretField`       | `String`  | `password` | The field `path` for secret values known only to the authenticating party |
| `protectIdentities` | `Boolean` | `false`    | Protect identities at the expense of usability                            |

### `identityField`

The field `path` for values that _uniquely_ identifies items.
For human actors this is usually a field that contains usernames or email addresses.
For automated access, the `id` may be appropriate.

### `secretField`

The field `path` for secret values known only to the authenticating party.
The type used by this field must expose a comparison function with the signature
`compare(candidateValue, storedValue)` where:

- `candidateValue` is the (plaintext) value supplied by the actor attempting to authenticate
- `storedValue` is a value stored by the field on an item (usually a hash)

The build in `Password` field type fulfils this requirements.

### `protectIdentities`

Generally, KeystoneJS strives to provide users with detailed error messages.
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

> **Note:** An application should respond with a generic error message regardless of whether the user ID or password was incorrect.
> It should also give no indication to the status of an existing account.

Efforts are also taken to protect against timing attacks.
The time spend verifying an actors credentials should be constant-time regardless of the reason for failure.
