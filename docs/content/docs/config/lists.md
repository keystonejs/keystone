---
title: 'Lists API'
description: 'Reference docs for Keystone’s Lists API, which defines the data model of your system.'
---

The `lists` property of the [system configuration](./config) object is where you define the data model, or schema, of your Keystone system.
It accepts an object with list names as keys, and `list()` configurations as values.

```typescript
import { config, list } from '@keystone-6/core'

export default config({
  lists: {
    SomeListName: list({
      fields: {
        /* ... */
      },
      actions: {
        /* ... */
      },
      access: {
        /* ... */
      },
      ui: {
        /* ... */
      },
      hooks: {
        /* ... */
      },
      graphql: {
        /* ... */
      },
      db: {
        /* ... */
      },
      isSingleton: false,
    }),
    /* ... */
  },
  /* ... */
})
```

This document will explain the configuration options which can be used with the `list()` function.

Options:

- `isSingleton`: This flag, when `true` changes the list to default to only supporting a single row. See [Singletons](#is-singleton) for details.

## fields

The `fields` option defines the names, types, and configuration of the fields in the list.
This configuration option takes an object with field names as keys and configured field types as values.

```typescript
import { config, list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: text({
          /* ... */
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
})
```

For full details on the available field types and their configuration options please see the [Fields API](../fields/overview).

## actions

The `actions` property of the list configuration object is where you define actions that can triggered for items on your list.
An action can be triggered on individual items or in bulk from the list view in the Admin UI, or directly using GraphQL.

```typescript
import { config, list, action } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { text, integer } from '@keystone-6/core/fields'

export default config({
  lists: {
    Post: list({
      access: allowAll,
      fields: {
        title: text(),
        votes: integer({ defaultValue: 0 }),
      },
      actions: {
        vote: action({
          access: allowAll,
          async resolve({ where }, context) {
            if (!where) return null
            return await context.prisma.post.update({
              where: { id: where.id },
              data: { votes: { increment: 1 } },
            })
          },
          ui: {
            label: 'Vote +1',
            icon: 'voteIcon',
          },
        }),
      },
    }),
  },
})
```

Each action accepts the following options:

- `access` (**required**): An access control function that determines who can use this action. Receives `{ context, session, listKey, actionKey }`.
- `resolve` (**required**): The function that performs the action. Receives `{ listKey, actionKey, where }` and `context`. Should return the updated item or `null`.
- `graphql`: Options for the GraphQL schema output.
  - `singular`: Override the name of the singular mutation (default: `{action}{list.graphql.singular}`, e.g. `votePost`).
  - `plural`: Override the name of the plural mutation (default: `{action}{list.graphql.plural}`, e.g. `votePosts`).
  - `description` (default: `undefined`): Sets the description of the associated GraphQL type in the GraphQL schema output.
- `ui` (**required**): Controls how the action appears in the Admin UI.
  - `label` (**required**): The label shown on the action button.
  - `icon`: An icon name from `@keystar/ui/icon/all` to display alongside the label.
  - `messages`: Locale messages for prompts and notifications. Supports template tags: `{singular}`, `{plural}`, `{singular|plural}`, `{itemLabel}`, `{count}`, `{countSuccess}`, `{countFail}`.
    - `promptTitle`, `promptTitleMany`, `prompt`, `promptMany`: Confirmation dialog text.
    - `promptConfirmLabel`, `promptConfirmLabelMany`: Confirm button text.
    - `success`, `successMany`: Success toast messages.
    - `fail`, `failMany`: Failure toast messages.
  - `itemView`: Controls for the item view.
    - `actionMode` (default: `'enabled'`): Can be `'enabled'`, `'disabled'`, or `'hidden'`, a conditional filter object, or a function that returns one of those values. Conditional filter objects can combine field predicates with nested `AND`, `OR`, and `NOT` groups.
    - `navigation` (default: `'follow'`): Controls navigation after the action completes. `'follow'` navigates to the returned item (or list view if `null`), `'refetch'` stays and refreshes the item, `'return'` goes back to the list view.
    - `hidePrompt` (default: `false`): Do not show a confirmation dialog.
    - `hideToast` (default: `false`): Do not show a toast notification.
  - `listView`: Controls for the list view.
    - `actionMode` (default: `'enabled'`): Can be `'enabled'` or `'hidden'`, a conditional filter object, or a function that returns one of those values. Conditional filter objects can combine field predicates with nested `AND`, `OR`, and `NOT` groups.

## access

The `access` option defines the [Access Control](../guides/auth-and-access-control) rules for the list.
These rules determine which of the CRUD (create, read, update, delete) operations users are allowed to perform.

See the [Access Control API](./access-control) for full details on the available access control options.

## fieldDefaults

The `fieldDefaults` option provides defaults using the same nesting as field configuration. It supports `access`, `graphql.omit` and `ui.createView/itemView/listView.fieldMode`. Per-field configuration takes precedence; group UI defaults take precedence over list UI defaults.

## ui

The `ui` option controls how the list is displayed and interacted with in the Admin UI.

Options:

- `labelField`: Selects the field which will be used as the label column in the Admin UI.
  By default looks for a field called `'label'`, then falls back to `'name'`, then `'title'`, and finally `'id'`, which is guaranteed to exist.
- `searchFields`: The fields used by the Admin UI when searching this list on the list view and in relationship fields. Nominated fields need to support the `contains` filter.
  It is always possible to search by an id and `'id'` should not be specified in this option.
  By default, the `labelField` is used if it has a string `contains` filter, otherwise none.
- `hideNavigation` (default: `false`): Controls whether the list is visible in the navigation elements of the Admin UI.
  Can be either a boolean value or an async function with an argument `{ session, context }` that returns a boolean value.
- `hideCreate` (default: `false`): Controls whether the `create` button is available in the Admin UI for this list.
  Can be either a boolean value or an async function with an argument `{ session, context }` that returns a boolean value.
- `hideDelete` (default: `false`): Controls whether the `delete` button is available in the Admin UI for this list.
  Can be either a boolean value or an async function with an argument `{ session, context }` that returns a boolean value.
- `listView`: Controls the list view page of the Admin UI.
  - `initialColumns` (default: The first three fields defined in the list). A list of field names to display in columns in the list view. By default only the label column, as determined by `labelField`, is shown.
  - `initialSort` (default: `undefined`): Sets the field and direction to be used to initially sort the data in the list view.
    Option `field` is the name of the field to sort by, and `direction` is either `'ASC'` or `'DESC'` for ascending and descending sorting respectively.
    If undefined then data will be unsorted.
  - `pageSize` (default: lower of `50` or [`graphql.maxTake`](#graphql)): Sets the number of items to show per page in the list view.
  - `initialFilter` (default: `undefined`): Sets a default column filter to apply to the list view. Accepts a where input object (excluding `AND`, `OR`, `NOT`), or an async function with an argument `{ session, context }` that returns a where input object. 
- `label`: The label used to identify the list in navigation etc.
- `singular`: The singular form of the list key. It is used in sentences like `Are you sure you want to delete this {singular}?`
- `plural`: The plural form of the list key. It is used in sentences like `Are you sure you want to delete these {plural}?`
- `path`: A path segment to identify the list in URLs. It must match the pattern `/^[a-z-_][a-z0-9-_]*$/`.

```typescript
import { config, list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: { name: text({ /* ... */ }) },
      ui: {
        label: 'Some List',

        singular: 'Item',
        plural: 'Items',
        path: 'some-list',

        labelField: 'name',
        searchFields: ['name', 'alternativeName'],
        hideNavigation: ({ session, context }) => false,
        hideCreate: ({ session, context }) => false,
        hideDelete: ({ session, context }) => false,
        listView: {
          initialColumns: ['name', /* ... */],
          initialSort: { field: 'name', direction: 'ASC' },
          initialFilter: { isPublished: { equals: true } },
          pageSize: 50,
        },
      },
      fieldDefaults: {
        ui: {
          createView: { fieldMode: ({ session, context }) => 'edit' },
          itemView: { fieldMode: ({ session, context, item }) => 'edit' },
          listView: { fieldMode: ({ session, context }) => 'read' },
        },
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

The `graphql` property allows you to configure certain aspects of the GraphQL API.

Options:

- `description` (default: `undefined`): Sets the description of the associated GraphQL type in the GraphQL schema output.
- `singular`: (default: Singular list key, e.g. `'User'`): Overrides the name used in singular mutations and queries (e.g. `user()`, `updateUser()`, etc).
- `plural`: (default: Pluralised list key, e.g. `'Users'`): Overrides the name used in multiple mutations and queries (e.g. `users()`, `updateUsers()`, etc).
- `maxTake` (default: `undefined`): Allows you to specify the maximum `take` number for query operations on this list in the GraphQL API.
- `cacheHint` (default: `undefined`): Allows you to specify the [dynamic cache control hints](https://www.apollographql.com/docs/apollo-server/performance/caching/#in-your-resolvers-dynamic) used for queries to this list.
- `omit` (default: `undefined`): Allows you to configure which parts of the CRUD API are autogenerated for your GraphQL API.
  This option accepts either `true`, or an object with the below fields.
  If you specify `true` then the entire list, including its output type, will be omitted from the GraphQL API.
  - `omit.query` (default: `false`): A boolean omits all queries, or use an object with required `one`, `many`, and `count` booleans. These settings also control singular relationships, many relationships, and relationship counts respectively.
  - `omit.create` (default: `false`): If set to true, the create mutation will be omitted from the GraphQL API for this list.
  - `omit.update` (default: `false`): If set to true, the update mutation will be omitted from the GraphQL API for this list.
  - `omit.delete` (default: `false`): If set to true, the delete mutation will be omitted from the GraphQL API for this list.

```typescript
import { config, list } from '@keystone-6/core'

export default config({
  lists: {
    SomeListName: list({
      graphql: {
        description: '...',
        singular: '...',
        plural: '...',
        maxTake: 100,
        cacheHint: { maxAge: 60, scope: 'PRIVATE' },
        omit: {
          query: { one: true, many: true, count: true },
          create: true,
          update: true,
          delete: true,
        },
      },
      /* ... */
    }),
    /* ... */
  },
  /* ... */
})
```

## db

The `db` config option allows you to configure certain aspects of the database connection specific to this list.

Options:

- `idField` (default: `{ kind: 'cuid' }`): The kind of id field to use, it can be one of: `cuid`, `uuid` or `autoincrement`.
  The default across all lists can be changed at the root-level `db.idField` config.
  If you are using `autoincrement`, you can also specify `type: 'BigInt'` on PostgreSQL and MySQL to use BigInts.
- `map`: Adds a [Prisma `@@map`](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#map-1) attribute to the Prisma model for this list which specifies a custom database table name for the list, instead of using the list key
- `indexes`: An array of `{ fields: [...] }` declarations for ordinary database indexes (`@@index`). Each must contain at least one field.
- `unique`: An array of `{ fields: [...] }` declarations for compound database unique constraints (`@@unique`). Each must contain at least two fields. For single-field uniqueness, continue to use the field's `isIndexed: 'unique'` option.
- `extendPrismaSchema`: A function that receives this list's generated Prisma model, including declarative indexes and constraints, and returns its replacement. It runs after field-level schema extensions and before the root-level `db.extendPrismaSchema` callback.

```typescript
import { config, list } from '@keystone-6/core'

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
})
```

### Indexes and compound unique constraints

Use ordered field combinations to describe the lookup patterns and uniqueness scope of your application:

```typescript
import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { integer, text } from '@keystone-6/core/fields'

const Inventory = list({
  access: allowAll,
  db: {
    indexes: [{ fields: ['quantity'] }, { fields: ['warehouse', 'quantity'] }],
    unique: [{ fields: ['sku', 'warehouse'] }],
  },
  fields: {
    sku: text(),
    warehouse: text(),
    quantity: integer(),
  },
})
```

This generates `@@index([quantity])`, `@@index([warehouse, quantity])` and `@@unique([sku, warehouse])`.
The database rejects two items with the same SKU **and** warehouse, on both inserts and updates.
Sharing just the SKU or just the warehouse is allowed: compound members are not made individually unique.
Declarations can contain more than two fields, for example `unique: [{ fields: ['key', 'locale', 'channel'] }]` for translations scoped to both locale and channel.
There is no built-in tenant, domain, or other application-specific scope; each declaration covers exactly its listed fields on one list's table.
Database collation and comparison rules still apply.

The declarations enforce uniqueness in the database, including concurrent writes; preflight queries and validation hooks are not a substitute for this enforcement.
Each `unique` declaration also exposes a [compound unique selector](../graphql/overview#compound-unique-selectors) in GraphQL queries, mutations, relationships, and pagination cursors, and in `context.db` and `context.query`.
For this example, the selector is `{ sku_warehouse: { sku: 'ABC', warehouse: 'north' } }`.
Existing selectors, such as `id` and individually unique fields, keep their current behavior, as does Prisma-error reporting through GraphQL.
Resolve conflicting existing data before applying a new unique constraint to a populated database.

#### Supported fields and validation

Use Keystone field keys, not database column names from `db.map`.
Table and column mappings continue to work: Prisma applies those mappings when creating the indexes.
Prisma generates index and constraint names; this API does not expose database `map` names or Prisma compound-selector `name` options.

Fields must store a single scalar or enum value, for example text, numbers, booleans, timestamps, or selects.
Required and nullable fields are supported, subject to the null behavior below.
Relationships (including those owning foreign keys), virtual fields, multi-column fields such as files/images, arrays, and JSON fields are not supported by these declarations.
Generated foreign-key and multi-column component names cannot be used as field keys.
On MySQL, Text/Blob native types (including the default Bytes type) require index lengths, which this API does not expose; use a suitable bounded native type or a schema extension.
PostgreSQL's Xml native type does not support default indexes and is also rejected.
Other database limits, such as maximum index size, remain subject to Prisma and database validation.

Compound unique members must also provide an exact selector value input.
Built-in `text`, `integer`, `float`, `bigInt`, `decimal`, `checkbox`, `timestamp`, `calendarDay`, `bytes`, and `select` fields support this, subject to their provider restrictions.
Custom fields can supply `input.uniqueWhereValue` with a scalar/enum GraphQL argument and, if needed, a resolver to the exact stored value.
Its argument must be nullable and have no default; Keystone makes it required within the compound input.
This resolver must not apply mutation defaults, hashing, uploads, or other side effects.
An existing scalar/enum `input.uniqueWhere` is used as a fallback; the field must still meet the existing standalone uniqueness requirements to expose that input.
Fields such as `password` do not provide an exact-value contract and are rejected as compound members.
Ordinary `indexes` do not require this contract.
Generated tuple types use the field's GraphQL scalar/enum input type.
For custom scalars unknown to Keystone's type generator, the member is `NonNullable<unknown>`: the scalar's runtime parser must validate its precise input representation.

The selector name is the ordered field keys joined with underscores, matching Prisma's default compound key.
For example, `['sku', 'warehouse']` produces `sku_warehouse`; column/table mappings do not change it.
The generated input type is `<WhereUniqueInputName>_<selectorName>`, such as `InventoryWhereUniqueInput_sku_warehouse`.
Names that collide with actual fields, other compound selectors, or generated GraphQL types are rejected, as are invalid GraphQL names.

An omitted option or an empty declarations array (`indexes: []` or `unique: []`) adds nothing.
Empty declarations, missing/empty field lists, unknown or repeated fields, unsupported options, and duplicate declarations of the same kind and field order fail during initialization.
A single-field index must not repeat a primary key or an existing field-level `isIndexed` setting.
Field-level indexes may still participate in compound declarations and otherwise remain unchanged.
An ordinary index and a unique constraint on the same tuple are allowed, although the extra ordinary index is usually unnecessary.

Declaration and field order are preserved.
`['a', 'b']` and `['b', 'a']` are distinct declarations with different index order; neither is sorted or silently merged.
Changing the order of a unique constraint changes its index order, not which complete tuples are considered duplicates.

#### Nullable uniqueness and advanced indexes

The Prisma version used by Keystone supports nullable fields in compound constraints.
However, standard unique constraints on [SQLite](https://www.sqlite.org/lang_createtable.html#unique_constraints), [PostgreSQL](https://www.postgresql.org/docs/18/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS), and [MySQL](https://dev.mysql.com/doc/refman/8.4/en/create-index.html) treat nulls as distinct.
For example, `unique: [{ fields: ['slug', 'domain'] }]` allows multiple rows with the same slug and a null domain.
It does **not** enforce “same slug and same domain, including null” when null represents a meaningful application scope.
This API does not introduce a null sentinel or offer null-equality options.
Selectors require every member to be present and non-null, even when its database column is nullable.
The compound selector object itself may be omitted, but explicitly passing `null` is rejected.
Null-containing tuples cannot be addressed through compound selectors; use an ID or ordinary filtering instead.
PostgreSQL supports `NULLS NOT DISTINCT`, but it is not part of these declarations.

Keep using `db.extendPrismaSchema` for custom names and advanced features that Prisma can express, such as provider-specific index options.
Features Prisma cannot express require separately managed database-specific migrations.
Keystone does not parse or reconcile schema text returned by extension callbacks; keeping that text valid and avoiding duplicate declarations there remains the caller's responsibility.
Constraints added only through schema extensions do not generate selectors.
Do not remove, rename, or alter a declarative unique constraint in a schema extension while relying on its selector: the generated metadata must correspond to the actual database constraint.

## isSingleton

The `isSingleton` flag changes a list to only have support for a single row with an `id` of `1`.

With the flag set, when an item is created it is given an `id` of `1`, and when an item is queried from a list, the GraphQL `where` filter defaults to `{ id: '1' }`.

An example of when this might helpful is for editing data like your frontend configuration, when it wouldn't otherwise be checked into source control.

Abstracting singletons as a behavioural trait of lists instead of a distinct type helps developers build functions for lists without needing to know the underlying constraints, effectively ensuring that lists remain as functors.

Using GraphQL, to query a list named `seoConfiguration`, with `isSingleton` set, you can write any of the following queries

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

Try out our [Singleton Example](https://github.com/keystonejs/keystone/blob/main/examples/singleton/schema.ts) to see it in action.

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
The API to configure all the parts of your Keystone system.
{% /well %}
{% well
heading="Example Project: Blog"
href="https://github.com/keystonejs/keystone/tree/main/examples/usecase-blog"
target="_blank" %}
A basic Blog schema with Posts and Authors. Use this as a starting place for learning how to use Keystone. It’s also a starter for other feature projects.
{% /well %}
{% /related-content %}
