<!--[meta]
section: api
title: Access control
order: 4
[meta]-->

# Access control

Control who can do what with your GraphQL API.

> **Note:** This is the API documentation for access control. For getting started, see the [Access control guide](/docs/guides/access-control.md) or the [Authentication Guide](/docs/guides/authentication.md).

There are three domains of access control:

1. List level
2. Field level
3. Custom schema

To set defaults for all lists, fields, and custom schema, use the `defaultAccess` config when
creating a `Keystone` instance. Each defaults to `true` if omitted.

```javascript
const keystone = new Keystone('My App', {
  defaultAccess: {
    list: true,
    field: true,
    custom: true,
  },
});
```

## The `auth` operation

In addition to the standard Create/Read/Update/Delete (CRUD) operations, Keystone includes an Authenticate (`auth`) operation.
Access to this operation may be configured at list level (not field level) and controls whether authentication queries and mutations are accessible on that list.

If you have a `List` which is being used as the target of an Authentication Strategy, you should set `access: { auth: true }` on that list.

## List level access control

List level access control can have varying degrees of specificity depending on
how much control you need.

A key on the list config, `access` can be specified either as a single control,
covering all CRUDA operations, or as an object keyed by CRUDA operation names.

There are 3 ways to define the values of `access`, in order of flexibility:

1. Static
2. Imperative
3. Declarative

```typescript
interface GraphQLWhere {
  [key: string]: any;
}

interface AccessInput {
  authentication: {
    item?: {};
    listKey?: string;
  };
  listKey?: string;
  operation?: string;
  originalInput?: {};
  gqlName?: string;
  itemId?: string;
  itemIds?: [string];
}

type StaticAccess = boolean;
type ImperativeAccess = (arg: AccessInput) => boolean;
type DeclarativeAccess = GraphQLWhere | ((arg: AccessInput) => GraphQLWhere);

interface GranularAccess {
  create?: StaticAccess | ImperativeAccess;
  read?: StaticAccess | ImperativeAccess | DeclarativeAccess;
  update?: StaticAccess | ImperativeAccess | DeclarativeAccess;
  delete?: StaticAccess | ImperativeAccess | DeclarativeAccess;
  auth?: StaticAccess;
}

type ListConfig = {
  access: StaticAccess | ImperativeAccess | GranularAccess;
};
```

`GraphQLWhere` matches the `where` clause on the GraphQl type. For instance, on
the list `User` it would match the input type `UserWhereInput`.

`AccessInput` has the following properties:

| Property                 | Description                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `authentication`         | The currently authenticated user.                                                             |
| `authentication.item`    | The details of the current user. Will be `undefined` for anonymous users.                     |
| `authentication.listKey` | The list key of the currently authenticated user. Will be `undefined` for anonymous users.    |
| `listKey`                | The key of the list being operated on.                                                        |
| `operation`              | The CRUDA operation being performed (`'create'`, `'read'`, `'update'`, `'delete'`, `'auth'`). |
| `originalInput`          | For `create` and `update` mutations, this is the data as passed in the mutation.              |
| `gqlName`                | The name of the query or mutation which triggered the access check.                           |
| `itemId`                 | The `id` of the item being updated/deleted in singular `update` and `delete` operations.      |
| `itemIds`                | The `ids` of the items being updated/deleted in multiple `update` and `delete` operations.    |
| `context`                | The `context` of the originating GraphQL operation.                                           |

When resolving `StaticAccess`:

- `true`: Allow access
- `false`: Do not allow access

Definition of `access` operations:

| Operation | Description                                            |
| --------- | ------------------------------------------------------ |
| `create`  | Ability to create new items in the list.               |
| `read`    | Ability to view / fetch data on any items in the list. |
| `update`  | Ability to alter data on any items in the list.        |
| `delete`  | Ability to remove an item from the list.               |
| `auth`    | Ability to use this list for authentication.           |

When access is denied, the GraphQL response will contain an error with
`type: 'AccessDeniedError'`, and `null` for the data.

> **Note:** The `create` operation cannot be given `DeclarativeAccess` - it does
> not make sense to do so and will throw an error if attempted. Additionally,
> the `auth` operation control must be of type `StaticAccess`.

### Shorthand static Boolean

Great for blanket access control for lists you want everyone/no one to see.

```javascript
keystone.createList('User', {
  access: true,
});
```

> **Note:** When set to `false`, the list queries/mutations/types will not be included in the GraphQL schema.

### Granular static Boolean

Use when you need some more fine grained control over what actions users can perform.

```javascript
keystone.createList('User', {
  access: {
    create: true,
    read: true,
    update: true,
    delete: true,
    auth: true,
  },
});
```

> **Note:** When set to `false`, the list queries/mutations/types exclusive to
> that operation will not be included in the GraphQL schema. For example,
> setting `create: false` will cause the `createXXXX` mutation to be excluded
> from the schema, `update: false` will cause the `updateXXXX` mutation to be
> excluded, and so on.

### Shorthand imperative Boolean

Enables turning access on/off based on the currently authenticated user.

```javascript
keystone.createList('User', {
  access: ({ authentication: { item, listKey } }) => {
    return true;
  },
});
```

> **Note:** Even when returning `false`, the queries/mutations/types _will_ be
> included in the GraphQL Schema.

### Granular imperative Boolean

Use when you need some more fine grained control over what actions some or all
anonymous/authenticated users can perform.

```javascript
keystone.createList('User', {
  access: {
    create: ({ authentication: { item, listKey } }) => true,
    read: ({ authentication: { item, listKey } }) => true,
    update: ({ authentication: { item, listKey } }) => true,
    delete: ({ authentication: { item, listKey } }) => true,
  },
});
```

> **Note:** Even when returning `false`, the queries/mutations/types for that
> operation _will_ be included in the GraphQL Schema. For example, `create: () => false` will still include the `createXXXX` mutation in
> the GraphQL Schema, and so on.

### GraphQLWhere

In the examples below, the `name_contains: 'k'` syntax matches the `UserWhereInput` GraphQL type for the list.

1. For singular `read`/`update`/`delete` operations, when the `GraphQLWhere`
   clause results in 0 items, an `AccessDeniedError` is returned.
2. For batch `read` operations (eg; `query { allUsers }`), when the
   `GraphQLWhere` clause results in 0 items returned, no error is returned.
3. For `create` operations, an `AccessDeniedError` is returned if the operation
   is set to / returns `false`

#### Granular static `GraphQLWhere`

Use when you need some more fine grained control over what items a user can
perform actions on.

```javascript
keystone.createList('User', {
  access: {
    create: true,
    read: { name_contains: 'k' },
    update: { name_contains: 'k' },
    delete: { name_contains: 'k' },
  },

  fields: {
    name: { type: Text },
  },
});
```

#### Granular imperative `GraphQLWhere`

Use when you need some more fine grained control over which items _and_
actions anonymous/authenticated users can perform.

```javascript
keystone.createList('User', {
  access: {
    create: ({ authentication: { item, listKey } }) => true,
    read: ({ authentication: { item, listKey } }) => ({
      state_not: 'deactivated',
    }),
    update: ({ authentication: { item, listKey } }) => ({
      state_not: 'deactivated',
    }),
    delete: ({ authentication: { item, listKey } }) => ({
      state_not: 'deactivated',
    }),
  },

  fields: {
    state: {
      type: Select,
      options: ['active', 'deactivated'],
      defaultValue: 'active',
    },
  },
});
```

## Field level access control

A key on the field config, `access` can be specified either as a single control,
covering all CRU operations, or as an object keyed by CRU operation names.

> **Important:** Unlike List level access, it is not possible to specify a Declarative
> _where_ clause for Field level access.

There are 2 ways to define the values of `access`, in order of flexibility:

1. Static
2. Imperative

```typescript
interface AccessInput {
  authentication: {
    item?: {};
    listKey?: string;
  };
  listKey?: string;
  fieldKey?: string;
  originalInput?: {};
  existingItem?: {};
  operation?: string;
  gqlName?: string;
  itemId?: string;
  itemIds?: [string];
  context?: {};
}

type StaticAccess = boolean;
type ImperativeAccess = (arg: AccessInput) => boolean;

interface GranularAccess {
  create?: StaticAccess | ImperativeAccess;
  read?: StaticAccess | ImperativeAccess;
  update?: StaticAccess | ImperativeAccess;
}

type FieldConfig = {
  access: StaticAccess | ImperativeAccess | GranularAccess;
};
```

> **Note:** Fields do not have `delete` or `auth` access controls - these controls exists on
> the list level only (it's not possible to _"delete"_ an existing field value -
> only to modify it, and authentication is list-wide).

| Property                 | Description                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `authentication`         | The currently authenticated user.                                                                             |
| `authentication.item`    | The details of the current user. Will be `undefined` for anonymous users.                                     |
| `authentication.listKey` | The list key of the currently authenticated user. Will be `undefined` for anonymous users.                    |
| `listKey`                | The key of the list being operated on.                                                                        |
| `fieldKey`               | The key of the field being operated on.                                                                       |
| `originalInput`          | The data as passed in the mutation for `create` and `update` mutations (`undefined` for `read`).              |
| `existingItem`           | The existing item this field belongs to for `update` mutations and `read` queries (`undefined` for `create`). |
| `operation`              | The CRU operation being performed (`'create'`, `'read'`, `'update'`).                                         |
| `gqlName`                | The name of the query or mutation which triggered the access check.                                           |
| `itemId`                 | The `id` of the item being updated/deleted in singular `update` and `delete` operations.                      |
| `itemIds`                | The `ids` of the items being updated/deleted in multiple `update` and `delete` operations.                    |
| `context`                | The `context` of the originating GraphQL operation.                                                           |

When defining `StaticAccess`:

- `true`: Allow access
- `false`: Do not allow access

Definition of `access` operations:

| Operation | Description                                                     |
| --------- | --------------------------------------------------------------- |
| `create`  | Ability to set the value of the field when creating a new item. |
| `read`    | Ability to view / fetch the value of this field on an item.     |
| `update`  | Ability to alter the value of this field on an item.            |

When access is denied, the GraphQL response will contain an error with `type: 'AccessDeniedError'`,
and `null` for the field.

Let's break it down into concrete examples:

### Shorthand static Boolean

Great for blanket access control for fields you want everyone/no one to see.

```javascript
keystone.createList('User', {
  fields: {
    name: {
      type: Text,
      access: true,
    },
  },
});
```

> **Note:** When set to `false`, the list queries/mutations/types will not include
> this field in the GraphQL schema.

### Granular static Boolean

Use when you need some more fine grained control over what actions users can
perform with this field.

```javascript
keystone.createList('User', {
  fields: {
    name: {
      type: Text,
      access: {
        create: true,
        read: true,
        update: true,
      },
    },
  },
});
```

> **Note:** When set to `false`, this field will not be included in GraphQL
> queries/mutations/types exclusively used by that operation.
> Eg, setting `update: false` in the example above will remove the `name` field from the
> `UserUpdateInput` type but may still include the field in `UserCreateInput` for example.

### Shorthand imperative Boolean

Enables turning access on/off based on the currently authenticated user.

```javascript
keystone.createList('User', {
  fields: {
    name: {
      type: Text,
      access: ({ authentication: { item, listKey }, existingItem }) => {
        return true;
      },
    },
  },
});
```

> **Note:** Even when returning `false`, the queries/mutations/types _will_
> include the field in the GraphQL Schema.

### Granular imperative Boolean

Use when you need some more fine grained control over what actions some or all
anonymous/authenticated users can perform.

```javascript
keystone.createList('User', {
  access: {
    create: ({ authentication: { item, listKey }, existingItem }) => true,
    read: ({ authentication: { item, listKey }, existingItem }) => true,
    update: ({ authentication: { item, listKey }, existingItem }) => true,
  },
});
```

> **Note:** Even when returning `false`, this field _will_ be included in GraphQL
> queries/mutations/types exclusively used by that operation.
> Eg, setting `update: () => false` in the example above will still include the
> `name` field in the `UserUpdateInput` type.

## Custom schema access control

[Custom GraphQL schema](https://www.keystonejs.com/keystonejs/keystone/#extendgraphqlschemaconfig) can also be access-controlled.
Each custom type, query, and mutation accepts an `access` key.

There are two ways to define the value of `access`:

1. Static
2. Imperative

```typescript
interface AccessInput {
  item {};
  args {} ;
  context: {};
  info: {};
  authentication: {
    item?: {};
    listKey?: string;
  };
  gqlName: string;
}

type StaticAccess = boolean;
type ImperativeAccess = (arg: AccessInput) => boolean;

type CustomOperationConfig = {
  access: StaticAccess | ImperativeAccess;
};
```

### Static boolean

```javascript
keystone.extendGraphQLSchema({
  queries: [
    {
      schema: 'getUserByName(name: String!): Boolean',
      resolver: async (item, args, context, info, { query, access }) => {...},
      access: true,
    },
  ],
});
```

> Useful if default custom access controls are set to `false`.

_NOTE:_ When set to `false`, the custom queries/mutations/types will not be included in the GraphQL schema.

### Imperative boolean

```javascript
keystone.extendGraphQLSchema({
  queries: [
    {
      schema: 'getUserByName(name: String!): Boolean',
      resolver: async (item, args, context, info, { query, access }) => {...},
      access: async ({ item, args, context, info, authentication: { item: authedItem, listKey }, gqlName }) => {
        return true;
      },
    },
  ],
});
```

> Enables turning access on/off based on the currently authenticated user.

_NOTE:_ Even when returning `false`, the custom queries/mutations/types _will_ be included in the GraphQL Schema.
