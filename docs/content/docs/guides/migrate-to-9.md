---
title: 'Migrate to @keystone-6/core@9.0.0'
description: 'Upgrade from @keystone-6/core@8 to @keystone-6/core@9.0.0'
---

`@keystone-6/core@9` changes how applications configure sessions, run GraphQL operations from a context, and enable file uploads. It also changes how Keystone validates `*WhereUniqueInput` and applies access control to relationship filters. If you are upgrading from `@keystone-6/core@7` or earlier, start with the [migration guide for `@keystone-6/core@8.0.0`](./migrate-to-8).

See [the changelog](https://github.com/keystonejs/keystone/releases/tag/2026-11-26) for the complete changes.

## Update packages

```sh
pnpm add @keystone-6/core@^9
```

Install or update the packages your project uses.

| If your project uses                                               | Run                                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `createAuth`, built-in session strategies, or the `password` field | `pnpm add @keystone-6/auth@^11`                                         |
| The `document` field                                               | `pnpm add @keystone-6/fields-document@^12`                              |
| The `image` or `file` field                                        | `pnpm add @keystone-6/fields-media-multipart@^1 graphql-upload@^17.1.0` |
| The `cloudinaryImage` field                                        | `pnpm add @keystone-6/cloudinary@^11 graphql-upload@^17.1.0`            |

## Import password field from `@keystone-6/auth`

```diff
-import { password, text } from '@keystone-6/core/fields'
+import { text } from '@keystone-6/core/fields'
+import { password } from '@keystone-6/auth'
```

Replace `validation.rejectCommon` with a field `hooks.validate` rule if you need to keep screening common passwords. Use `inputFieldData` to read the submitted password on create and update.

## Replace `session` with `getSession`

Move session loading from the top-level `session` option to an async `getSession({ context })` callback. Return a session object for authenticated requests or `undefined` for unauthenticated requests. For a custom session implementation, call your existing logic from `getSession` and update its header access as described below.

`context.sessionStrategy` has been removed. Where your own code used `context.sessionStrategy`, call your application's session implementation directly.

## Update `createAuth` and the session shape

Replace `secretField` with `passwordField` and pass `sessionStrategy` and `getAuthenticatedItemId` to `createAuth`. Implement the lookup that used to be configured with `sessionData` in `getSession`. For example:

```ts
import { createAuth, jwtSessions } from '@keystone-6/auth'
import { config } from '@keystone-6/core'
import type { Lists, TypeInfo } from './generated/keystone/types'

declare module './generated/keystone/types' {
  interface Session {
    user: Pick<Lists.User.Item, 'id' | 'isAdmin'>
  }
}

const secret = process.env.SESSION_SECRET
if (!secret) throw new Error('SESSION_SECRET must be set')
const sessionStrategy = jwtSessions({ secret })

const { withAuth } = createAuth<Lists.User.TypeInfo>({
  listKey: 'User',
  identityField: 'email',
  passwordField: 'password',
  sessionStrategy,
  getAuthenticatedItemId: context => context.session?.user.id,
})

export default withAuth(
  config<TypeInfo>({
    ...etc,
    async getSession({ context }) {
      const token = await sessionStrategy.get({ context })
      if (!token) return

      const user = await context.sudo().db.User.findOne({
        where: { id: token.sub },
        select: { isAdmin: true },
      })
      return user ? { user } : undefined
    },
  })
)
```

For session data built from related items or virtual fields, use `context.graphql.run` in `getSession` to preserve the selection that you used in `sessionData`.

## Choose a session strategy

- Replace `statelessSessions` from `@keystone-6/core/session` with `jwtSessions` from `@keystone-6/auth`. JWTs are signed and their payload is readable by anyone holding the token. Keep confidential data server-side, or [keep using `@hapi/iron`](#keep-using-hapi-iron) for encrypted tokens.
- Import `storedSessions` from `@keystone-6/auth` to keep session data in your store. The token now carries a store identifier in `jti`.
- If you pass a custom `sessionStrategy` to `createAuth`, its `start` method now receives `{ sub }` with the authenticated item ID as a string and must return a non-empty session token. The `end` method handles sign-out. `getAuthenticatedItemId` synchronously returns the authenticated list item ID or `undefined`, this is used for the `authenticatedItem` query.

See the [authentication reference](../config/auth#sessions) for strategy options and store examples.

### Keep using `@hapi/iron` {% #keep-using-hapi-iron %}

You can replace `statelessSessions` with a custom strategy that also uses `@hapi/iron`.

```sh
pnpm add @hapi/iron@^7 cookie@^1
```

This example uses the old strategy's defaults. Reuse your existing session secret and any custom `ironOptions`, cookie name, or cookie settings so existing sessions keep working until they expire.

```ts
import Iron from '@hapi/iron'
import { parse, serialize } from 'cookie'
import type { KeystoneContext } from '@keystone-6/core/types'

export function ironSessions(secret: string) {
  if (secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters')

  const cookieName = 'keystonejs-session'
  const maxAge = 60 * 60 * 8
  const ironOptions = Iron.defaults
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax' as const,
  }

  return {
    async get({ context }: { context: KeystoneContext }) {
      const authorization = context.req?.get('authorization')
      const token = authorization?.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length)
        : parse(context.req?.get('cookie') ?? '')[cookieName]
      if (!token) return

      try {
        const payload: unknown = await Iron.unseal(token, secret, ironOptions)
        if (!payload || typeof payload !== 'object' || !('itemId' in payload)) return

        const { itemId } = payload
        if (typeof itemId === 'string' || typeof itemId === 'number') {
          return { sub: String(itemId) }
        }
      } catch {
        // Invalid or expired tokens leave the request unauthenticated.
      }
    },
    async start({ context, data }: { context: KeystoneContext; data: { sub: string } }) {
      const token = await Iron.seal({ itemId: data.sub }, secret, {
        ...ironOptions,
        ttl: maxAge * 1000,
      })
      context.res?.append('Set-Cookie', serialize(cookieName, token, { ...cookieOptions, maxAge }))
      return token
    },
    async end({ context }: { context: KeystoneContext }) {
      context.res?.append(
        'Set-Cookie',
        serialize(cookieName, '', { ...cookieOptions, maxAge: 0, expires: new Date(0) })
      )
    },
  }
}
```

## Update GraphQL authentication mutations

Replace list-specific mutations such as `authenticateUserWithPassword(email: ..., password: ...)` with `authenticateWithPassword(identity: ..., password: ...)`. The argument names are fixed regardless of your list's field names. The type names have also been updated to `AuthenticationWithPasswordResult`, `AuthenticationWithPasswordSuccess`, and `AuthenticationWithPasswordFailure`.

```graphql
mutation SignIn($identity: String!, $password: String!) {
  authenticateWithPassword(identity: $identity, password: $password) {
    ... on AuthenticationWithPasswordSuccess {
      sessionToken
      item {
        id
      }
    }
    ... on AuthenticationWithPasswordFailure {
      message
    }
  }
}
```

### Keep the old authentication mutation

If you need to keep the existing authentication mutation/type names, you can add them back with a schema extension like this, adjust `User` and the field names to your own schema:

```ts
import { g } from '@keystone-6/core'
import type { Lists } from './generated/keystone/types'

const extendSchemaWithAuthenticateUserWithPassword = g.extend(base => {
  const authenticate = base.schema.getMutationType()?.getFields().authenticateWithPassword?.resolve
  if (!authenticate) throw new Error('The Keystone password authentication mutation is missing')

  const success = g.object<{ sessionToken: string; item: Lists.User.Item }>()({
    name: 'UserAuthenticationWithPasswordSuccess',
    fields: {
      sessionToken: g.field({ type: g.nonNull(g.String) }),
      item: g.field({ type: g.nonNull(base.object('User')) }),
    },
  })
  const failure = g.object<{ message: string }>()({
    name: 'UserAuthenticationWithPasswordFailure',
    fields: {
      message: g.field({ type: g.nonNull(g.String) }),
    },
  })
  const result = g.union({
    name: 'UserAuthenticationWithPasswordResult',
    types: [success, failure],
    resolveType(value) {
      return 'sessionToken' in value
        ? 'UserAuthenticationWithPasswordSuccess'
        : 'UserAuthenticationWithPasswordFailure'
    },
  })

  return {
    mutation: {
      authenticateUserWithPassword: g.field({
        type: result,
        deprecationReason: 'Use authenticateWithPassword',
        args: {
          email: g.arg({ type: g.nonNull(g.String) }),
          password: g.arg({ type: g.nonNull(g.String) }),
        },
        async resolve(source, { email, password }, context, info) {
          return (await authenticate(source, { identity: email, password }, context, info)) as g<
            typeof result
          >
        },
      }),
    },
  }
})
```

## Use `Headers` in request contexts

`context.req` and `context.res` now hold WHATWG `Headers` objects. Replace `context.req?.headers.authorization` with `context.req?.get('authorization')` and `context.res?.setHeader(name, value)` with `context.res?.set(name, value)`.

In custom HTTP integrations, replace `context.withRequest(req, res)` with `context.withHeaders(requestHeaders, responseHeaders)`. For a WHATWG fetch `Request`, pass `request.headers` directly. For Node or Express, build a `Headers` object from `req.headers`. `withHeaders` loads the session through `getSession`.

Keystone's built-in server forwards outgoing headers. Custom integrations must forward them when constructing their HTTP response. For Node or Express, forward cookies as an array with `res.setHeader('Set-Cookie', responseHeaders.getSetCookie())`. You can also not provide response headers in `context.withHeaders`, it just won't be possible to set headers like cookies in mutations.

If a hook or access function needs information about a request besides a header such as an IP address, set a header in `server.extendExpressApp` before Keystone's GraphQL handler and use that header.

## Replace `context.query`

Use [`context.graphql.run`](../context/overview#graph-ql-helpers) when you need GraphQL fields, including nested selections and virtual fields. Supply a complete query or mutation and pass inputs as variables. Destructure the root field from the returned `data` object.

```ts
// @keystone-6/core@8
const user = await context.query.User.findOne({
  where: { id },
  query: 'id name posts { id title }',
})
```

```ts
// @keystone-6/core@9
const { user } = await context.graphql.run({
  query: `
    query UserById($id: ID!) {
      user(where: { id: $id }) {
        id
        name
        posts { id title }
      }
    }
  `,
  variables: { id },
})
```

To infer result and variable types for `context.graphql.run`, see the [typed GraphQL documents example](../context/overview#typed-graphql-documents).

Use [`context.db`](../context/db-items) for counts, getting database item columns, or when you return list items from a custom GraphQL resolver.

## Enable multipart uploads

Import `image` and `file` from `@keystone-6/fields-media-multipart`.

If you use `image`, `file`, `cloudinaryImage`, or a custom multipart upload field, register the upload middleware on your GraphQL endpoint in `server.extendExpressApp`. Move your old `server.maxFileSize` value to the middleware options. Use the same endpoint path as `graphql.path` if you customize it.

```ts
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'

// In your Keystone config:
server: {
  extendExpressApp(app) {
    app.use('/api/graphql', graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 10 }))
  },
},
```

For custom GraphQL fields, replace `g.Upload` with the default export from `graphql-upload/GraphQLUpload.mjs`. See the [images and files guide](./images-and-files) for a complete configuration.

## Pass non-empty, non-null unique where inputs

Provide at least one key in every `*WhereUniqueInput`. For example, pass `{ email }` only when you have an email and skip the lookup if you have no unique value. An empty selector such as `{}` now raises an input error, including in `findOne`.

## Review access control for relationship filters

Keystone now applies the related list's `access.operation.query` and `access.filter.query` when a caller filters through a relationship. The related list receives the query `kind` of the outer operation.

| Outer operation                                | Query kind on related lists |
| ---------------------------------------------- | --------------------------- |
| `findOne` and update or delete `where` lookups | `one`                       |
| `findMany`                                     | `many`                      |
| `count`                                        | `count`                     |

See [filtering through relationships](../config/access-control#filtering-through-relationships) for more information.
