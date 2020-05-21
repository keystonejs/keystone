<!--[meta]
section: api
subSection: field-types
title: Virtual
[meta]-->

# Virtual

The `Virtual` field type allows you to define a read-only field which you define the resolver for.
This can be used to return computed values, values combining multiple fields, or custom formated values.

## Usage

The most basic usage is to provide a `resolver` function which returns a `String` value.

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

`Virtual` fields can take arguments to be used by the resolver function using the `args` option, which takes a list of `{ name, type }` values.

```js
const { Virtual, CalendarDay } = require('@keystonejs/fields');
const { format, parseISO } = require('date-fns');

keystone.createList('Example', {
  fields: {
    date: { type: CalendarDay },
    formattedDate: {
      resolver: (item, { formatAs = 'do MMMM, yyyy' }) =>
        item.date && format(parseISO(item.date), formatAs),
      args: [{ name: 'formatAs', type: 'String' }],
    },
  },
});
```

## Config

| Option                  | Type       | Default    | Description                                                                                          |
| ----------------------- | ---------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `resolver`              | `Function` | (required) |                                                                                                      |
| `graphQLReturnType`     | `String`   | `String`   | A GraphQL Type String                                                                                |
| `graphQLReturnFragment` | `String`   | `''`       | A GraphQL Fragment String - Used by the Admin UI and required if using a nested `graphQLReturnType`. |
| `extendGraphQLTypes`    | `Array`    | `[]`       | An array of custom GraphQL type definitions                                                          |
| `args`                  | `Array`    | `[]`       | An array of `{ name, type }` indicating the supported arguments for the field                        |

> **Note:** Related fields within a virtual field resolver will not return related items.

If you need to access related items, you can perform a subsequent graphql query within the resolver. The reason for this limitation is, we can't know which related items are required. Since it is possible for items to have millions of related items, it would be problematic to immediately look and return all of these.
