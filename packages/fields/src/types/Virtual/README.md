<!--[meta]
section: api
subSection: field-types
title: Virtual
[meta]-->

# Virtual

## Usage

If the resolver is a function that returns a string you don't need to define a return type.

```js
const { Virtual, Text } = require('@keystonejs/fields');

keystone.createList('Example', {
  fields: {
    firstName: { type: Text },
    lastName: { type: Text },
    name: {
      type: Virtual,
      resolver: item => (`${item.firstName} ${item.lastName}`)
      };
    },
  },
});
```

If the return type is not a string define a `graphQLReturnType`.

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

## Config

| Option                  | Type       | Default    | Description                                                 |
| ----------------------- | ---------- | ---------- | ----------------------------------------------------------- |
| `resolver`              | `Function` | (required) |                                                             |
| `graphQLReturnType`     | `String`   | `String`   | A GraphQL Type String                                       |
| `graphQLReturnFragment` | `String`   | `''`       | A GraphQL Fragment String -required for nested return types |
| `extendGraphQLTypes`    | `Array`    | `[]`       | An array of custom GraphQL type definitions                 |

> **Note:** Related fields within a virtual field resolver will not return related items.

If you need to access related items, you can perform a subsequent graphql query within the resolver. The reason for this limitation is, we can't know which related items are required. Since it is possible for items to have millions of related items, it would be problematic to immediately look and return all of these.
