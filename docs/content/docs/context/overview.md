---
title: 'Context Overview'
description: "The Context object is the primary API entry point for all of the run-time functionality of your system. It's APIs can be used to write things like access control, hooks, testing and GraphQL schema extensions."
---

The `Context` object is the primary API entry point for all of the run-time functionality of your Keystone system.
In GraphQL, a [`context`](https://graphql.org/learn/execution/#root-fields-resolvers) is a value which is provided to every resolver and holds important contextual information such as the currently logged in user, or access to a database.
Keystone makes a `Context` object available as the context of all resolvers in the system.
The APIs provided by the `Context` object can be used to write the business logic for things like [access control](../guides/auth-and-access-control), [hooks](../guides/hooks), [testing](../guides/testing) and GraphQL [schema extensions](../guides/schema-extension).

The `Context` object has the following properties, which are documented below.

```typescript
import type { Context } from './generated/keystone/types'

const context = {
  // Query API
  query,

  // Database API
  db,

  // HTTP request object
  req,
  res,

  // Session API
  session,
  sessionStrategy,

  // GraphQL helpers
  graphql: {
    schema,
    run,
    raw,
  },

  // New context creators
  sudo,
  internal,
  withRequest,
  withSession,

  // Transactions
  transaction,

  // Raw Prisma access
  prisma,
}
```

### HTTP request object

`req`: The [IncomingMessage](https://nodejs.org/api/http.html#class-httpincomingmessage) object from the HTTP request.
`res`: The [ServerResponse](https://nodejs.org/api/http.html#class-httpserverresponse) object for the HTTP request.

### Query API

`query`: The [Query API](./query), which can be used to perform CRUD operations against your GraphQL API and return a queried value.

### Database API

`db`: The [Database API](./db-items), which can be used to perform CRUD operations against your GraphQL API and return database objects suitable for return from mutations in [schema extensions](../guides/schema-extension).

### GraphQL helpers

`graphql.schema`: The [GraphQL Schema](https://graphql.org/graphql-js/type/#graphqlschema) object, which can be used directly, or via `graphql.raw` and `graphql.run`.

`graphql.run` executes a GraphQL operation and returns `data`. If any errors occur, the first error is thrown.

`graphql.raw` returns the GraphQL [`ExecutionResult`](https://graphql.org/graphql-js/execution/), including `data` and `errors`.

Both helpers take `{ query, variables }` and execute the operation with the current context.

#### Typed GraphQL documents {% #typed-graphql-documents %}

You can use tools like [gql.tada](https://gql-tada.0no.co) to write typed operations against Keystone's generated `schema.graphql`. TypeScript infers the result type and checks the variables you supply.

```typescript
import { graphql } from './tada'

const AuthorById = graphql(`
  query AuthorById($id: ID!) {
    author(where: { id: $id }) {
      id
      name
    }
  }
`)

const { author } = await context.graphql.run({
  query: AuthorById,
  variables: { id: 'author-id' },
})
```

The [Keystone gql.tada example](https://github.com/keystonejs/keystone/tree/main/examples/graphql-gql.tada) shows how to configure `graphql()`.
The helpers also accept `TypedDocumentNode` values from other libraries. See the [GraphQL Code Generator example](https://github.com/keystonejs/keystone/tree/main/examples/graphql-codegen).

GraphQL strings and plain [`DocumentNode`](https://graphql.org/graphql-js/language/#parse) objects also work though they will not have typed results or variables.

### Session API

If you configure your Keystone system with session management then you will have access to the following properties.
See the [session API](../config/session#session-context) for more details.

`session`: The current session data object.

`sessionStrategy`: an object containing functions(`get`, `start` and `end`) that manipulate a session. See the [session API](../config/session#session-context) for more details.

### New context creators

Keystone applies access control using the current context and its session. The following functions create a new `Context` with different settings.

`sudo()`: Returns a new `Context` that bypasses Keystone access control.

`internal()`: A function which returns a new `Context` object that bypasses `graphql.omit` on lists and fields, allowing you to query and mutate data that is otherwise omitted from the GraphQL API.

`withRequest(req, res)`: A function which returns a new `Context` object with the `.session` determined by your `sessionStrategy.get` function.

`withSession(newSession)`: A function which returns a new `Context` object with the `.session` object replaced by the `newSession` argument.

### Database access

The `Context` object exposes the underlying database driver directly via `context.prisma`, which is a [Prisma Client](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference) object.

{% hint kind="warn" %}
Access through `context.prisma` bypasses the GraphQL schema and Keystone access control.
{% /hint %}

### Transactions

`transaction(fn, options)`: Runs `fn` inside a Prisma transaction and passes it a new `Context` object backed by the transaction client. The optional `options` argument is forwarded to Prisma's `$transaction` call.

## Related resources

{% related-content %}
{% well
heading="Query API Reference"
href="/docs/context/query" %}
A programmatic API for running CRUD operations against your GraphQL API. For each list in your system you get an API at `context.query.<listName>`
{% /well %}
{% well
heading="DB API Reference"
href="/docs/context/db-items" %}
The API for running CRUD operations against the internal GraphQL resolvers in your system. It returns internal item objects, which can be returned from GraphQL resolvers.
{% /well %}
{% /related-content %}
