---
title: "Lists API"
description: "Reference docs for Keystone’s Lists API, which defines the data model of your system."
---

The `lists` property of the [system configuration](./config) object is where you define the data model, or schema, of your Keystone system.
It accepts an object with list names as keys, and `list()` configurations as values.

```typescript
import { config, list } from '@keystone-6/core';

export default config({
  lists: ({
    SomeListName: list({
      fields: { /* ... */ },
      access: { /* ... */ },
      ui: { /* ... */ },
      hooks: { /* ... */ },
      graphql: { /* ... */ },
      db: { /* ... */ },
      description: '...',
      isSingleton: false,
      defaultIsFilterable: false,
      defaultIsOrderable: false,
    }),
    /* ... */
  }),
  /* ... */
});
```

This document will explain the configuration options which can be used with the `list()` function.

Options:

- `isSingleton`: This flag, when `true` changes the list to default to only supporting a single row. See [Singletons](#is-singleton) for details.
- `defaultIsFilterable`: This value sets the default value to use for `isFilterable` for fields on this list.
- `defaultIsOrderable`: This value sets the default value to use for `isOrderable` for fields on this list.

## fields

The `fields` option defines the names, types, and configuration of the fields in the list.
This configuration option takes an object with field names as keys and configured field types as values.

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: text({ /* ... */ }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```

For full details on the available field types and their configuration options please see the [Fields API](../fields/overview).

## access

The `access` option defines the [Access Control](../guides/auth-and-access-control) rules for the list.
These rules determine which of the CRUD (create, read, update, delete) operations users are allowed to perform.

See the [Access Control API](./access-control) for full details on the available access control options.

## ui

The `ui` option controls how the list is displayed and interacted with in the Admin UI.

Options:

- `labelField`: Selects the field which will be used as the label column in the Admin UI.
  By default looks for a field called `'label'`, then falls back to `'name'`, then `'title'`, and finally `'id'`, which is guaranteed to exist.
- `searchFields`: The fields used by the Admin UI when searching this list on the list view and in relationship fields.
  It is always possible to search by an id and `'id'` should not be specified in this option.
  By default, the `labelField` is used if it has a string `contains` filter, otherwise none.
- `description` (default: `undefined`): Sets the list description displayed in the Admin UI.
- `isHidden` (default: `false`): Controls whether the list is visible in the navigation elements of the Admin UI.
  Can be either a boolean value or an async function with an argument `{ session, context }` that returns a boolean value.
- `hideCreate` (default: `false`): Controls whether the `create` button is available in the Admin UI for this list.
  Can be either a boolean value or an async function with an argument `{ session, context }` that returns a boolean value.
- `hideDelete` (default: `false`): Controls whether the `delete` button is available in the Admin UI for this list.
  Can be either a boolean value or an async function with an argument `{ session, context }` that returns a boolean value.
- `createView`: Controls the create view page of the Admin UI.
  - `defaultFieldMode` (default: `'edit'`):
    Can be overridden by per-field values in the `field.ui.createView.fieldMode` config.
    See the [Fields API](../fields/overview#common-configuration) for details.
    Can be one of `['edit', 'hidden']`, or an async function with an argument `{ session, context }` that returns one of `['edit', 'hidden']`.
- `itemView`: Controls the item view page of the Admin UI.
  - `defaultFieldMode` (default: `'edit'`):
    Can be overridden by per-field values in the `field.ui.itemView.fieldMode` config.
    See the [Fields API](../fields/overview#common-configuration) for details.
    Can be one of `['edit', 'read', 'hidden']`, or an async function with an argument `{ session, context, item }` that returns one of `['edit', 'read', 'hidden']`.
- `listView`: Controls the list view page of the Admin UI.
  - `defaultFieldMode` (default: `'read'`): Controls the default mode of fields in the list view.
    Can be overridden by per-field values in the `field.ui.listView.fieldMode` config.
    See the [Fields API](../fields/overview#common-configuration) for details.
    Can be one of `['read', 'hidden']`, or an async function with an argument `{ session, context }` that returns one of `['read', 'hidden']`.
  - `initialColumns` (default: The first three fields defined in the list). A list of field names to display in columns in the list view. By default only the label column, as determined by `labelField`, is shown.
  - `initialSort` (default: `undefined`): Sets the field and direction to be used to initially sort the data in the list view.
    Option `field` is the name of the field to sort by, and `direction` is either `'ASC'` or `'DESC'` for ascending and descending sorting respectively.
    If undefined then data will be unsorted.
  - `pageSize` (default: lower of `50` or [`graphql.maxTake`](#graphql)): Sets the number of items to show per page in the list view.
- `label`: The label used to identify the list in navigation etc.
- `singular`: The singular form of the list key. It is used in sentences like `Are you sure you want to delete this {singular}?`
- `plural`: The plural form of the list key. It is used in sentences like `Are you sure you want to delete these {plural}?`
- `path`: A path segment to identify the list in URLs. It must match the pattern `/^[a-z-_][a-z0-9-_]*$/`.

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields`;

export default config({
  lists: {
    SomeListName: list({
      fields: { name: text({ /* ... */ }) },
      ui: {
        labelField: 'name',
        searchFields: ['name', 'alternativeName'],
        description: '...',
        isHidden: ({ session, context }) => false,
        hideCreate: ({ session, context }) => false,
        hideDelete: ({ session, context }) => false,
        createView: {
          defaultFieldMode: ({ session, context }) => 'edit',
        },
        itemView: {
          defaultFieldMode: ({ session, context, item }) => 'edit',
        },
        listView: {
          defaultFieldMode: ({ session, context }) => 'read',
          initialColumns: ['name', /* ... */],
          initialSort: { field: 'name', direction: 'ASC' },
          pageSize: 50,
        },
        label: "Some List",
        singular: "Item",
        plural: "Items",
        path: 'some-list'
      },
    }),
    /* ... */
  },
  /* ... */
});
```

## hooks

The `hooks` option defines [hook](../guides/hooks) functions for the list.
Hooks allow you to execute code at different stages of the mutation lifecycle.

See the [Hooks API](./hooks) for full details on the available hook options.

## graphql

The `graphql` config option allows you to configure certain aspects of the GraphQL API.

Options:

- `description` (default: `undefined`): Sets the description of the associated GraphQL type in the generated GraphQL API documentation.
  Overrides the list-level `description` config option.
- `plural`: (default: Pluralised list key, e.g. `'Users'`): Overrides the name used in multiple mutations and queries (e.g. `users()`, `updateUsers()`, etc).
- `maxTake` (default: `undefined`): Allows you to specify the maximum `take` number for query operations on this list in the GraphQL API.
- `cacheHint` (default: `undefined`): Allows you to specify the [dynamic cache control hints](https://www.apollographql.com/docs/apollo-server/performance/caching/#in-your-resolvers-dynamic) used for queries to this list.
- `omit` (default: `undefined`): Allows you to configure which parts of the CRUD API are autogenerated for your GraphQL API.
  This option accepts either `true`, or an array of the values `query`, `create`, `update`, or `delete`.
  If you specify `true` then the entire list, including its output type, will be omitted from the GraphQL API.
  If you provide an array of `query`, `create`, `update`, or `delete` options, the corresponding operations will be omitted from the GraphQL API.

```typescript
import { CacheScope } from 'apollo-cache-control';
import { config, list } from '@keystone-6/core';

export default config({
  lists: {
    SomeListName: list({
      graphql: {
        description: '...',
        itemQueryName: '...',
        listQueryName: '...',
        maxTake: 100,
        cacheHint: { maxAge: 60, scope: CacheScope.Private },
        omit: ['query', 'create', 'update', 'delete'],
      },
      /* ... */
    }),
    /* ... */
  },
  /* ... */
});
```

## db

The `db` config option allows you to configure certain aspects of the database connection specific to this list.

Options:

- `idField` (default: `{ kind: "cuid" }`): The kind of id field to use, it can be one of: `cuid`, `uuid` or `autoincrement`.
  The default across all lists can be changed at the root-level `db.idField` config.
  If you are using `autoincrement`, you can also specify `type: 'BigInt'` on PostgreSQL and MySQL to use BigInts.
- `map`: Adds a [Prisma `@@map`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#map-1) attribute to the Prisma model for this list which specifies a custom database table name for the list, instead of using the list key

```typescript
import { config, list } from '@keystone-6/core';

export default config({
  lists: {
    SomeListName: list({
      db: {
        idField: { kind: 'uuid' },
        map: 'table_name',
      },
      /* ... */
    }),
    /* ... */
  },
  /* ... */
});
```

## description

The `description` option defines a string that will be used as a description in the Admin UI and GraphQL API docs.
This option can be individually overridden by the `graphql.description` or `ui.description` options.

## isSingleton

The `isSingleton` flag changes a list to only have support for a single row with an `id` of `1`.
The flag provides the developer with a convenient syntax and defaults when working with lists that should only have zero or one items.
With this flag set, when an item is created it is given an `id` of `1`, and when an item is queried from a list, the GraphQL `where` filter defaults to `{ id: '1' }`.

An example of when this might helpful is for editable data like your configuration options when it isn't suitable to be stored on the filesystem.

Abstracting singletons as a behavioural trait of lists instead of a distinct type helps developers build functions for lists without needing to know the underlying constraints, effectively ensuring that lists remain as functors.

Using GraphQL, to query a list named `settings`, with `isSingleton` set, you can write any of the following queries

```graphql
query {
  # singular (null or an item)
  seoConfiguration {
    title
    description
  }

  # plural (0 or 1 items)
  seoConfigurations {
    title
    description
  }
}
```

In the Admin UI, lists with `isSingleton` set do not have a list view, instead redirecting you to the item view page of the item with an `id` of `1`.

The following additional constraints should be kept in mind when lists that have `isSingleton` set —

- With `id: 1` injected into respective filters, the `id` unique constraint will fail for create operations if an item already exists
- You cannot have relationships (`ref: 'Settings'`), if `Settings` is a list with `isSingleton` set
- You can however, have relationship fields in the `Settings` list, like normal

## Related resources

{% related-content %}
{% well
heading="Fields API Reference"
href="/docs/fields/overview" %}
Defines the names, types, and configuration of Keystone fields. See all the fields and the configuration options they accept.
{% /well %}
{% well
heading="Config API Reference"
href="/docs/config/overview" %}
The API to configure all the parts parts of your Keystone system.
{% /well %}
{% well
heading="Example Project: Blog"
href="https://github.com/keystonejs/keystone/tree/main/examples/blog"
target="_blank" %}
A basic Blog schema with Posts and Authors. Use this as a starting place for learning how to use Keystone. It’s also a starter for other feature projects.
{% /well %}
{% /related-content %}
