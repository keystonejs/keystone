---
title: 'Authentication'
description: 'API reference for supporting authentication against a password field using the createAuth() function in the `@keystone-6/auth` package.'
---

Keystone allows you to extend your Keystone system to support authentication against a `password` field using the `createAuth()` function in the `@keystone-6/auth` package.

For examples of how to use authentication in your system please see the [authentication guide](../guides/auth-and-access-control).

```typescript
import { config, list } from '@keystone-6/core'
import { text, checkbox } from '@keystone-6/core/fields'
import { createAuth, jwtSessions, password } from '@keystone-6/auth'

const sessionStrategy = jwtSessions()

const { withAuth } = createAuth({
  // Required options
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',

  sessionStrategy,
  getAuthenticatedItemId(context) {
    return context.session?.user.id
  },
})

export default withAuth(
  config({
    lists: {
      User: list({
        fields: {
          email: text({ isIndexed: 'unique' }),
          password: password(),
          isAdmin: checkbox(),
        },
      }),
    },
    async getSession({ context }) {
      const data = await sessionStrategy.get({ context })
      if (!data) return
      const user = await context.sudo().db.User.findOne({ where: { id: data.sub } })
      return user ? { user } : undefined
    },
  })
)
```

The function `createAuth` returns a function `withAuth` which should be used to wrap your `config()`.
This wrapper validates the auth configuration, adds GraphQL authentication operations and Admin UI sign-in functionality. You need to implement `getSession` to define what `context.session` should contain.

## Sessions

The session strategy is passed to `createAuth` so auth mutations can start and end sessions. The same strategy should also be used in `getSession` which controls what goes on `context.session`.

```typescript
import { config } from '@keystone-6/core'
import { createAuth, jwtSessions } from '@keystone-6/auth'
import type { TypeInfo, Lists } from './generated/keystone/types'

const sessionStrategy = jwtSessions()

declare module './generated/keystone/types' {
  interface Session {
    user: Lists.User.Item
  }
}

const { withAuth } = createAuth<Lists.User.TypeInfo>({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy,
  getAuthenticatedItemId(context) {
    return context.session?.user.id
  },
})

export default withAuth(
  config<TypeInfo>({
    async getSession({ context }) {
      const data = await sessionStrategy.get({ context })
      if (!data) return
      const user = await context.sudo().db.User.findOne({
        where: { id: data.sub },
      })
      return user ? { user } : undefined
    },
    // ...
  })
)
```

`getAuthenticatedItemId` synchronously maps the application's hydrated session to the authenticated list item. It must return a string, number, or `undefined`; `undefined` means the session does not represent an authenticated item. The top-level `getSession` callback is responsible for loading all session data.

Custom strategies used with `withHeaders` read and write WHATWG headers through `context.req` and `context.res`.

The built-in strategies set and clear the session cookie through `context.res`. If a context is created with `context.withHeaders(req)` and no `res`, `authenticateWithPassword` still returns a `sessionToken` that can be sent as a `Bearer` token, but no cookie is set, and `endSession` does not clear one. To set cookies outside of Keystone's own GraphQL and Admin UI routes, pass a response `Headers` object as the second argument to `withHeaders` and copy the headers onto your response.

### Session strategies

Keystone provides two reference implementations of session strategies that can be used with `createAuth` and `getSession`:

- `jwtSessions`
- `storedSessions`

#### JWT

With `jwtSessions`, session cookies are signed as JSON Web Tokens using HMAC SHA-256 (HS256).

{% hint kind="warn" %}
JWTs are signed, not encrypted. Anyone holding the cookie can read its payload, so only put data in a session that is safe for the client to see. Use `storedSessions` or a custom session strategy if this is a problem for your use case.
{% /hint %}

The object passed to `start()` is used as the JWT payload along with automatically added `iat` and `exp` claims. `get` returns the decoded payload if the signature is valid and the token is not expired, otherwise it returns `undefined`.

```typescript
import { jwtSessions } from '@keystone-6/auth'

const jwt = jwtSessions()
```

Options:

- `secret` (default: `crypto.getRandomValues(new Uint8Array(32))`): The secret used to sign the JWT with HS256. It can either be a `Uint8Array` or a string in which case it is UTF-8 encoded. It must be at least 32 characters or bytes long.

  Production deployments should generate the value once, store it securely, and provide the same secret to every process and after restarts so that sessions remain valid through restarts.

- `maxAge` (default: `60 * 60 * 8` (8 hours)): The number of seconds until the [cookie expires](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie). JWT verification also rejects tokens whose `iat` is older than `maxAge`, even if their `exp` is later.
- `secure` (default: `process.env.NODE_ENV === 'production'`): If `true`, the cookie is only sent to the server when a request is made with the `https:` scheme (except on localhost), and therefore is more resistant to man-in-the-middle attacks.
  **Note:** Do not assume that `secure` prevents all access to sensitive information in cookies (session keys, login details, etc.).
  Cookies with this attribute can still be read or modified with access to the client's hard disk, or from JavaScript if the HttpOnly cookie attribute is not set.
  **Note:** Insecure sites (`http:`) can't set cookies with the `secure` attribute (since Chrome 52 and Firefox 52).
  For Firefox, the `https:` requirements are ignored when the `secure` attribute is set by localhost (since Firefox 75).
- `path` (default: `'/'`): A path that must exist in the requested URL, or the browser won't send the cookie header.
  The forward slash (`/`) character is interpreted as a directory separator, and subdirectories will be matched as well: for `path: '/docs'`, `/docs`, `/docs/Web/`, and `/docs/Web/HTTP` will all match.
- `domain` (default: current document URL): Host to which the cookie will be sent. See [cookie attributes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes) for more details on the `domain` attribute.
  **Note:** Only one domain is allowed. If a domain is specified then subdomains are always included.
- `sameSite` (default: `'lax'`): Controls whether the cookie is sent with cross-origin requests. Can be one of `true`, `false`, `'strict'`, `'lax'` or `'none'`. See [cookie attributes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes) for more details on the `sameSite` attribute.
  **Note:** The `secure` attribute must also be set when `sameSite` is set to `none`.

If you want to use a different signing algorithm, you can implement your own session strategy. `createAuth` only needs an object with `start` and `end` methods:

```typescript
import type { KeystoneContext } from '@keystone-6/core/types'

const sessionStrategy = {
  // start a session for the authenticated item and return the session token
  async start({ context, data }: { context: KeystoneContext; data: { sub: string } }) {
    const token = await createSessionToken(data) // your own token logic
    // set a cookie so the browser sends the token on later requests
    // context.res is undefined when the context was created without response headers
    context.res?.set('Set-Cookie', `my-session=${token}; Path=/; HttpOnly; SameSite=Lax`)
    return token
  },
  // end the current session
  async end({ context }: { context: KeystoneContext }) {
    /* ... */
    // clear the cookie
    context.res?.set('Set-Cookie', 'my-session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
  },
}
```

How the session is read back is up to your `getSession` function.

#### Stored sessions

`storedSessions` uses a session store to persist session data. The session cookie contains a unique session ID, which is used to look up the session data in the store. Note the session ID is stored inside a JWT built with `jwtSessions` so the same options apply.

When using `storedSessions` you need to pass in a session store as the `store` option.
This `store` option must be a function `({ maxAge }) => { ... }` which returns a `SessionStore` object. The `SessionStore` and `SessionStoreFunction` types are exported from `@keystone-6/auth`.

```typescript
import { storedSessions } from '@keystone-6/auth'

const stored = storedSessions({
  store: ({ maxAge }) => ({
    /* ... */
  }),
})
```

A `SessionStore` object has the following interface:

```typescript
const store = {
  set: async (sessionId, data) => {
    /* ... */
  },
  get: async sessionId => {
    /* ... */
    return data
  },
  delete: async sessionId => {
    /* ... */
  },
}
```

- `set`: Set a value `data` for the key `sessionId`.
- `get`: Get the `data` value associated with `sessionId`.
- `delete`: Delete the entry associated with `sessionId` from the session store.

## Required options

The core functionality of the authentication system provides a GraphQL mutation to authenticate a user and then start a session, and a sign in page in the Admin UI.

- `listKey`: The name of the list to authenticate against.
- `identityField`: The name of the field to use as an identity field. This field must have `{ isIndexed: 'unique' }` set.
- `passwordField`: The name of the `password()` field used to authenticate users.
- `sessionStrategy`: An object with `start` and `end` methods used to start and end sessions, such as `jwtSessions()` or `storedSessions()`. See [session strategies](#session-strategies).
- `getAuthenticatedItemId`: A synchronous function that receives the `context` and returns the ID of the authenticated item from `context.session`, or `undefined` if the session does not represent an authenticated item.

```typescript
import { createAuth, jwtSessions } from '@keystone-6/auth'

const sessionStrategy = jwtSessions()

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy,
  getAuthenticatedItemId(context) {
    return context.session?.user.id
  },
})
```

#### GraphQL API {% #graphql-api %}

The following elements will be added to the GraphQL API. Where `User` is referenced in the schema below, your actual schema will use the list you provided in `listKey`.

```graphql
type Mutation {
  authenticateWithPassword(identity: String!, password: String!): AuthenticationWithPasswordResult
}

type Query {
  authenticatedItem: User
}

union AuthenticationWithPasswordResult =
  | AuthenticationWithPasswordSuccess
  | AuthenticationWithPasswordFailure

type AuthenticationWithPasswordSuccess {
  sessionToken: String!
  item: User!
}

type AuthenticationWithPasswordFailure {
  message: String!
}
```

##### authenticateWithPassword

This mutation will check the supplied credentials and start a new session if the credentials are valid.

```graphql
mutation {
  authenticateWithPassword(identity: "username@example.com", password: "password") {
    ... on AuthenticationWithPasswordSuccess {
      item {
        id
        email
      }
    }
    ... on AuthenticationWithPasswordFailure {
      message
    }
  }
}
```

On success the session handler will start a new session and return the encoded session cookie data as `sessionToken`.
The authenticated item will be returned as `item`.

On failure an `AuthenticationWithPasswordFailure` with the message `"Authentication failed."` will be returned.

##### authenticatedItem

This query will return the currently logged in user based on the `session` data. It uses the `getAuthenticatedItemId` function provided to `createAuth()` to get the authenticated item ID, and then loads the item from the database.

#### Admin UI

A sign in page at the path `/signin` will be added to the Admin UI.
If a user tries to access the Admin UI without having logged in they will be redirected back to `/signin`.
This page uses the `authenticateWithPassword` mutation to let users sign in to the Admin UI.

## Related resources

{% related-content %}
{% well
heading="Example Project: Authentication"
href="https://github.com/keystonejs/keystone/tree/main/examples/auth" %}
Adds password-based authentication to the Task Manager starter project.
{% /well %}
{% /related-content %}
