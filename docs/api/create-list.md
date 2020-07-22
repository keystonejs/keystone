<!--[meta]
section: api
title: Creating lists
order: 2
[meta]-->

# Creating lists

Keystone lists define your application's models. These models represent the
entities of your application domain and map to the tables in your database.

```javascript allowCopy=false showLanguage=false
keystone.createList('ListKey', {...});
```

## Config

| Option          | Type                                | Default                       | Description                                                            |
| --------------- | ----------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `access`        | `Function` \| `Object` \| `Boolean` | `true`                        | [Access control](/docs/guides/access-control.md) options for the list. |
| `adapterConfig` | `Object`                            |                               | Override the adapter config options for a specific list.               |
| `adminConfig`   | `Object`                            | `{}`                          | Options for the AdminUI.                                               |
| `adminDoc`      | `String`                            |                               | A description for the list used in the Admin UI.                       |
| `cacheHint`     | `Object`                            | `{}`                          | Configures a default caching hint for list.                            |
| `fields`        | `Object`                            |                               | Defines the fields in a list.                                          |
| `hooks`         | `Object`                            | `{}`                          | Functions to be called during list operations.                         |
| `itemQueryName` | `String`                            |                               | Changes the _item_ name in GraphQL queries and mutations.              |
| `label`         | `String`                            | `listName`                    | Overrides label for the list in the AdminUI.                           |
| `labelField`    | `String`                            | `name`                        | Specify a field to use as a label for individual list items.           |
| `labelResolver` | `Function`                          | Resolves `labelField` or `id` | Function to resolve labels for individual list items.                  |
| `listQueryName` | `String`                            |                               | Changes the _list_ name in GraphQL queries and mutations.              |
| `path`          | `String`                            |                               | Changes the path in the Admin UI.                                      |
| `plugins`       | `Array`                             | `[]`                          | An array of `plugins` that can modify the list config.                 |
| `plural`        | `String`                            |                               | Specify a plural for `Keystone` to use for the list.                   |
| `queryLimits`   | `Object`                            | `{}`                          | Configures list-level query limits.                                    |
| `schemaDoc`     | `String`                            |                               | A description for the list used in the GraphQL schema.                 |
| `singular`      | `String`                            |                               | Specify a singular noun for `Keystone` to use for the list.            |

## Definitions

### `access`

[Access control](/docs/guides/access-control.md) options for the list.

Options for `create`, `read`, `update` and `delete` - can be a function, GraphQL where clause or Boolean. See the [access control API documentation](/docs/api/access-control.md) for more details.

### `adapterConfig`

Override the adapter config options for a specific list. Normally `adapterConfig` is provided when initialising Keystone:

```javascript
const keystone = new Keystone({
  adapter: new Adapter({...}),
});
```

Specifying an adapter config on a list item will extend the default config for this list.

### `adminConfig`

Options for the AdminUI including:

- `defaultPageSize`
- `defaultColumns`
- `defaultSort`
- `maximumPageSize`

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

### `adminDoc`

A description for the list used in the Admin UI. To document the list in the GraphQL schema, see [`schemaDoc`](#schemadoc);

```javascript
keystone.createList('Todo', {
  adminDoc: 'A list of things which need to be done.',
});
```

### `fields`

Defines the fields to use in a list.

```javascript
keystone.createList('Post', {
  fields: {
    title: { type: Text },
  },
});
```

See: [Fields](/packages/fields/README.md) for more information on configuring field options.

### `hooks`

Specify functions to be executed during list operations.
Supported hooks include:

- Create and update operations
  - `resolveInput`
  - `validateInput`
  - `beforeChange`
  - `afterChange`
- Delete operations
  - `validateDelete`
  - `beforeDelete`
  - `afterDelete`

See [List Hooks in the API docs](/docs/api/hooks.md#list-hooks) and the [Hooks Guide](/docs/guides/hooks.md) for details.

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

### `itemQueryName`

Changes the item name in GraphQL queries and mutations.

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
  itemQueryName: 'Person',
});
```

With the above example a GraphQL query might look like this:

```graphql
query {
  Person(where: { id: "1" }) {
    name
  }
}
```

### `label`

Overrides label for the list in the AdminUI. Default is `listName`.

### `labelField`

Specify a field to use as a label for individual list items.

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

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
  },
  labelResolver: item => `${item.name} - ${item.email}`,
});
```

### `listQueryName`

Changes the list name in GraphQL queries and mutations.

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
  listQueryName: 'People',
});
```

With the above example a GraphQL query might look like this:

```graphql
query {
  allPeople {
    name
  }
}
```

### `path`

Changes the path in the Admin UI. Updating `plural` and `singular` values will not change the route in the admin UI. You can specify this using `path`.

### `plugins`

An array of functions that modify config values. Plugin functions receive `(config, { listKey, keystone })`, where `config` is the a list config object, `listKey` is the name of the list, and `keystone` is the keystone object. They should return a valid list config. Plugin functions are executed in the order provided in the list, with the output config of one being passed as input to the next. The output of the final plugin is used to construct the `List` instance.

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

### `plural`

Keystone will attempt to determine a plural for list items. Sometimes Keystone will not be able to determine the plural forcing you to change the list name. Or sometimes Keystone may get it wrong, especially for non-English words.

E.g. Keystone thinks the correct plural for Octopus is "Octopi". Everyone knows the scientifically accurate plural is "Octopodes":

```javascript
keystone.createList('Octopus', {
  fields: {
    legs: { type: Integer },
  },
  plural: 'Octopodes',
});
```

### `queryLimits`

Configuration for limiting the kinds of queries that can be made against the list, to avoid queries that might overload the server.

See also [global query limits on the Keystone object](/packages/keystone/README.md#querylimits).

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

### `schemaDoc`

A description for the list used in the GraphQL schema. To document the list in the Admin UI, see [`adminDoc`](#admindoc);

```javascript
keystone.createList('Todo', {
  schemaDoc: 'A list of things which need to be done.',
});
```

### `singular`

Keystone list names should be singular and Keystone will attempt to determine a plural.

Where Keystone can't determine a plural you may be forced to use a different list name.

The `singular` option allows you to change the display label for singular items.

E.g. Keystone can't determine a plural for 'Sheep'. Let's change the `singular` option:

```javascript
keystone.createList('WoolyBoi', {
  fields: {
    sheepName: { type: Text },
  },
  singular: 'Sheep',
  plural: 'Sheep',
});
```

> **Note:** This will override labels in the AdminUI but will not change graphQL queries. For queries and mutations see: `itemQueryName` and `listQueryName`.
