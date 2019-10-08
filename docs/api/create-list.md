<!--[meta]
section: api
title: Create List
order: 2
[meta]-->

# createList(name, options)

## Usage

```javascript
keystone.createList('Post', {
  /* ...config */
});
```

### Config

| Option          | Type                                | Default                       | Description                                                                             |
| --------------- | ----------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------- |
| `fields`        | `Object`                            |                               | Defines the fields in a list.                                                           |
| `schemaDoc`     | `String`                            |                               | A description for the list. Used in the Admin UI.                                       |
| `hooks`         | `Object`                            | `{}`                          | Specify hooks to execute functions after list actions.                                  |
| `labelField`    | `String`                            | `name`                        | Specify a field to use as a label for individual list items.                            |
| `labelResolver` | `Function`                          | Resolves `labelField` or `id` | Function to resolve labels for individual list items.                                   |
| `access`        | `Function` \| `Object` \| `Boolean` | `true`                        | [Access control](https://v5.keystonejs.com/guides/access-control) options for the list. |
| `adapterConfig` | `Object`                            |                               | Override the adapter config options for a specific list.                                |
| `itemQueryName` | `String`                            |                               | Changes the _item_ name in GraphQL queries and mutations.                               |
| `listQueryName` | `String`                            |                               | Changes the _list_ name in GraphQL queries and mutations.                               |
| `singular`      | `String`                            |                               | Specify a singular noun for `Keystone` to use for the list.                             |
| `plural`        | `String`                            |                               | Specify a plural for `Keystone` to use for the list.                                    |
| `path`          | `String`                            |                               | Changes the path in the Admin UI.                                                       |
| `plugins`       | `Array`                             | `[]`                          | An array of `plugins` that can modify the list config.                                  |
| `queryLimits`   | `Object`                            | `{}`                          | Configures list-level query limits.                                                     |
| `cacheHint`     | `Object`                            | `{}`                          | Configures a default caching hint for list.                                             |

### `fields`

Defines the fields to use in a list.

#### Usage

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
  },
});
```

See: [Fields](/keystone-alpha/fields/) for more information on configuring field options.

### `schemaDoc`

A description for the list used in the GraphQL schema.

### `hooks`

Specify hooks to execute functions after list actions. List actions include:

- `resolveInput`
- `validateInput`
- `beforeChange`
- `afterChange`
- `beforeDelete`
- `validateDelete`
- `afterDelete`

#### Usage

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
  hooks: {
    resolveInput: ({ resolvedData }) => {
      return {
        name: `${resolvedData.name} the Great!`,
      };
    },
  },
});
```

### `label`

Overrides label for the list in the AdminUI. Default is `listName`.

### `labelField`

Specify a field to use as a label for individual list items.

#### Usage

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
  labelField: 'name',
});
```

### `labelResolver`

Function to resolve labels for individual list item. Default resolves the `labelField`.

#### Usage

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
  labelResolver: item => `${item.name} - ${item.email}`,
});
```

### `access`

[Access control](https://v5.keystonejs.com/guides/access-control) options for the list.

Options for `create`, `read`, `update` and `delete` - can be a function, GraphQL where clause or Boolean. See the [access control API documentation](https://v5.keystonejs.com/api/access-control) for more details.

#### Usage

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
  access: {
    read: false,
  },
});
```

### `adminConfig`

Options for the AdminUI including:

- `defaultPageSize`
- `defaultColumns`
- `defaultSort`
- `maximumPageSize`

#### Usage

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
  adminConfig: {
    defaultColumns: 'name,email',
    defaultPageSize: 50,
    defaultSort: 'email',
    maximumPageSize: 100,
  },
});
```

### `itemQueryName`

Changes the item name in GraphQL queries and mutations.

#### Usage

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
  itemQueryName: 'Person',
});
```

With the above example a GraphQL query might look like this:

```
query {
  Person(where: {id: "1"}) {
    name
  }
}
```

### `listQueryName`

Changes the list name in GraphQL queries and mutations.

#### Usage

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
  listQueryName: 'People',
});
```

With the above example a GraphQL query might look like this:

```
query {
  allPeople {
    name
  }
}
```

### `singular`

KeystoneJS list names should be singular and KeystoneJS will attempt to determine a plural.

Where KeystoneJS can't determine a plural you may be forced to use a different list name.

The `singular` option allows you to change the display label for singular items.

E.g. KeystoneJS can't determine a plural for 'Sheep'. Let's change the `singular` option:

```javascript
keystone.createList('WoolyBoi', {
  fields: {
    sheepName: { type: Text },
  },
  singular: 'Sheep',
  plural: 'Sheep',
});
```

_Note_: This will override labels in the AdminUI but will not change graphQL queries. For queries and mutations see: `itemQueryName` and `listQueryName`.

### `plural`

KeystoneJS will attempt to determine a plural for list items. Sometimes KeystoneJS will not be able to determine the plural forcing you to change the list name. Or sometimes KeystoneJS may get it wrong, especially for non-English words.

E.g. KeystoneJS thinks the correct plural for Octopus is "Octopi". Everyone knows the scientifically accurate plural is "Octopodes":

```javascript
keystone.createList('Octopus', {
  fields: {
    legs: { type: Integer },
  },
  plural: 'Octopodes',
});
```

### `path`

Changes the path in the Admin UI. Updating `plural` and `singular` values will not change the route in the admin UI. You can specify this using `path`.

### `adapterConfig`

Override the adapter config options for a specific list. Normally `adapterConfig` is provided when initialising KeystoneJS:

```javascript
const keystone = new Keystone({
  name: 'my-project',
  adapter: new Adapter({
    /* ...adapterConfig */
  }),
});
```

Specifying an adapter config on a list item will extend the default config for this list.

### `plugins`

An array of functions that modify config values. Plugin functions receive a config object and can modify or extend this. They should return a valid list config.

```javascript
const setupUserList = ({ fields, ...config }) => {
  return {
    ...config,
    fields: {
      ...fields,
      name: { type: Text },
      password: { type: Password },
    },
  };
};

keystone.createList('User', {
  plugin: [setupUserList],
});
```

This provides a method for packaging features that can be applied to multiple lists.

### `queryLimits`

Configuration for limiting the kinds of queries that can be made against the list, to avoid queries that might overload the server.

See also [global query limits on the Keystone object](https://v5.keystonejs.com/api/keystone#query-limits).

- `maxResults`: maximum number of results that can be returned in a query (or subquery)

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
  },
  queryLimits: {
    maxResults: 100,
  },
});
```

### `cacheHint`

HTTP cache hint configuration for list. (See [Apollo docs](https://www.apollographql.com/docs/apollo-server/performance/caching/) and [HTTP spec](https://tools.ietf.org/html/rfc7234#section-5.2.2).)

- `scope`: `'PUBLIC'` or `'PRIVATE'` (corresponds to `public` and `private` `Cache-Control` directives)
- `maxAge`: maximum age (in seconds) that the result should be cacheable for

Cache headers need to be enabled in the `GraphQLApp` instance:

```javascript
const app = new GraphQLApp({
  apollo: {
    tracing: true,
    cacheControl: {
      defaultMaxAge: 3600,
    },
  },
  ...otherGraphqlOptions,
});
```

See also the [Apollo cache control doc](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-cache-control).

`PRIVATE` is a recommendation that browsers should cache the result, but forbids intermediate caches (like CDNs or corporate proxies) from storing it. It needs to be used whenever the result depends on the logged in user (including secrets and user-specific content like profile information). If the result could be different when a user logs in, `PRIVATE` should still be used even if no user is logged in.

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
  },
  cacheHint: {
    scope: 'PUBLIC',
    maxAge: 3600,
  },
});
```

Cache hints can be dynamically returned from a function that takes an object with these members:

- `results`: an array of query results
- `operationName`: the name of the GraphQL operation that generated the results
- `meta`: boolean value that's true for a meta (count) query

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
  },
  cacheHint: ({ meta }) => {
    if (meta) {
      return {
        scope: 'PUBLIC',
        maxAge: 3600,
      };
    } else {
      return {
        scope: 'PRIVATE',
        maxAge: 60,
      };
    }
  },
});
```
