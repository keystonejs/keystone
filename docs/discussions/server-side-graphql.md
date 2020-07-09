<!--[meta]
section: discussions
title: Server-side GraphQL Operations
[meta]-->

# Server-side GraphQL Operations

Keystone provides a GraphQL API which we generally think of as being an API that is accessed over HTTP from a client talking to a server.
There are many uses cases however where we want to execute GraphQL operations directly on the server.
These can be grouped into two main categories:

As part of a resolver, e.g.

- Hooks
- Access control
- Virtual field resolver
- Custom field type resolvers
- Custom query/mutation resolvers

As part of some other process, e.g.

- Migrations
- Data seeding
- Responding to a non-GraphQL HTTP request
- Testing
- Anything else a developer could possibly imagine

Keystone provides an API which give you complete control over how you execute server-side GraphQL operations in each of these situations.

## Background

There are four main things that go into executing a server-side GraphQL operation:

- A GraphQL schema
- The query string
- Variable values
- A `context` object

When executing queries over HTTP we only have control over the queries and variables.
On the server side we can also control the schema and the `context`.

In most Keystone systems there will only be a single schema, but it is possible to configure multiple schemas (although this is not well documented).

The [`context` object](https://www.apollographql.com/docs/apollo-server/data/resolvers/#the-context-argument) is a general purpose object which is made available to all resolvers. When performing HTTP queries this object is built by Apollo server based on the `request` object. When directly performing server-side operations we need to be able to create our own `context` object.

## Within Resolvers

While Keystone generates the basic CRUD resolvers for you, there are lots of ways you can write custom code which is executed during the resolver phase of a query.
These include:

- Hooks
- Access control
- Virtual field resolver
- Custom field type resolvers
- Custom query/mutation resolvers

The [signature of a resolver function](https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments) is `(parent, args, context, info)`.
The `context` argument is an object which is provided to all resolvers and can contain and state or functions which should be shared across all resolvers.
The `context` object is also passed through to all hooks and access control functions.

As a developer you might want to execute some GraphQL operations as part of your custom code.
This can be done using the function `context.executeGraphQL()`, which is added to the `context` object by Keystone.
This async function takes a `query` and `variables` as arguments and returns `{ data, errors }` as a response.

```javascript
const { gql } = require('apollo-server-express');

const { data, errors } = await context.executeGraphQL({
  query: gql` ... `,
  variables: { ... },
});
```

### Custom context

The function `context.executeGraphQL` will pass `context` through to the resolvers used in the operation.
There are some instances where you may wish to use a different context to perform the operation.
For example, you might wish to execute your operation with all access-control turned off, or authenticated as a different user.

This can be achieved using the function `context.createContext({ schemaName, authentication, skipAccessControl })`, which will create a new `context` object based on the supplied arguments.

- `schemaName`: This can be used to select the named schema if you have multiple schemas within your Keystone system.
- `authentication`: This is an object of the shape `{ item: { id }, listKey: '...' }` which is passed through to access control functions. This can be used to emulate executing the operations as a different user.
- `skipAccessControl`: This can be used to bypass all access control.

By default each of these values will take the value of the original `context` object.
You can use this functions like this:

```javascript
const { gql } = require('apollo-server-express');

const { data, errors } = await context.executeGraphQL({
  context: context.createContext({ ... }),
  query: gql` ... `,
  variables: { ... },
});
```

## General purpose operations

There are situations where you might want to execute a GraphQL operations outside of the context of a resolver function.
These include:

- Migrations
- Data seeding
- Responding to a non-GraphQL HTTP request
- Testing
- Anything else a developer could possibly imagine

In these cases there is no `context` object for you to borrow, but there is an API to create one for use.

The methods `keystone.createContext()` and `keystone.executeGraphQL()` behave almost exactly the same as the functions `context.createContext()` and `context.executeGraphQL()` respectively. There a few key differences

1. If you do not supply a `context` to `keystone.executeGraphQL()` it will create one using the default arguments to `keystone.createContext()`.
2. The default arguments for `context.createContext()` are `{ schemaName = 'public', authentication = {}, skipAccessControl = false}`. This is because there is no originating `context` object to borrow the defaults from.

These methods can be used anywhere you have access to the keystone object.

```javascript
const { gql } = require('apollo-server-express');

const { data, errors } = await keystone.executeGraphQL({
  context: keystone.createContext({ ... }),
  query: gql` ... `,
  variables: { ... },
});
```
