<!--[meta]
section: api
subSection: field-types
title: Virtual
[meta]-->

# Virtual

The `Virtual` field type allows you to define a read-only field which you define the resolver for.
This can be used to return computed values, values combining multiple fields, or custom formated values.
The `resolver` function used in the `Virtual` field type is an [apollo server resolver](https://www.apollographql.com/docs/apollo-server/data/resolvers/), and supports the same [arguments](https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments).

## Usage

The most basic usage is to provide a `resolver` function which returns a `String` value.
The first argument to the resolver function is the list `item`.

### Basic

```js
const { Virtual, Text } = require('@keystonejs/fields');

keystone.createList('Example', {
  fields: {
    firstName: { type: Text },
    lastName: { type: Text },
    name: {
      type: Virtual,
      resolver: item => `${item.firstName} ${item.lastName}`
      };
    },
  },
});
```

### Return type

If the return type is not `String` then you need to define `graphQLReturnType`.

```js
const { Virtual } = require('@keystonejs/fields');

keystone.createList('Example', {
  fields: {
    fortyTwo: {
      type: Virtual,
      graphQLReturnType: `Int`,
      resolver: () => 42,
    },
  },
});
```

### Complex return types

For more complex types you can define a `graphQLReturnFragment` as well as `extendGraphQLTypes`. Resolver functions can be `async` so you can even fetch data from the file system or an external API:

```js
const { Virtual } = require('@keystonejs/fields');

keystone.createList('Example', {
  fields: {
    movies: {
      type: Virtual,
      extendGraphQLTypes: [`type Movie { title: String, rating: Int }`],
      graphQLReturnType: `[Movie]`,
      graphQLReturnFragment: `{
        title
        rating
      }`,
      resolver: async () => {
        const response = await fetch('http://example.com/api/movies/');
        const data = await response.json();
        return data.map(({ title, rating }) => ({ title, rating }));
      },
    },
  },
});
```

### Field arguments

The GraphQL arguments to a `Virtual` field can be specified using the `args` option, which takes a list of `{ name, type }` values.
The values for these arguments are made available in the second argument to the resolver function.

```js
const { Virtual, CalendarDay } = require('@keystonejs/fields');
const { format, parseISO } = require('date-fns');

keystone.createList('Example', {
  fields: {
    date: { type: CalendarDay },
    formattedDate: {
      type: Virtual,
      resolver: (item, { formatAs = 'do MMMM, yyyy' }) =>
        item.date && format(parseISO(item.date), formatAs),
      args: [{ name: 'formatAs', type: 'String' }],
    },
  },
});
```

### Server-side queries

The `item` argument to the resolver function is the raw database representation of the item, so related items will not be directly available on this object.
If you need to access data beyond what lives on the `item` you can execute a [server-side GraphQL query](/docs/discussions/server-side-graphql.md) using `context.executeGraphQL()`.

```js
const { Virtual, CalendarDay } = require('@keystonejs/fields');
const { format, parseISO } = require('date-fns');

keystone.createList('Example', {
  fields: {
    virtual: {
      type: Virtual,
      resolver: async (item, args, context) => {
        const { data, errors } = await context.executeGraphQL({ query: `{ ... }` })
        ...
      }
    },
  },
});
```

## Config

| Option                  | Type       | Default                             | Description                                                                                          |
| ----------------------- | ---------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `resolver`              | `Function` | `async (item, args, context, info)` |                                                                                                      |
| `graphQLReturnType`     | `String`   | `String`                            | A GraphQL Type String                                                                                |
| `graphQLReturnFragment` | `String`   | `''`                                | A GraphQL Fragment String - Used by the Admin UI and required if using a nested `graphQLReturnType`. |
| `extendGraphQLTypes`    | `Array`    | `[]`                                | An array of custom GraphQL type definitions                                                          |
| `args`                  | `Array`    | `[]`                                | An array of `{ name, type }` indicating the supported arguments for the field                        |
