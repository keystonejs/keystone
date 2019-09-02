<!--[meta]
section: api
title: Access Control
order: 5
[meta]-->

# Access Control

Control who can do what with your GraphQL API.

_Note_: This is the API documentation for Access Control. For getting started,
see the [Access Control Guide](https://v5.keystonejs.com/guides/access-control) or the
[Authentication Guide](https://v5.keystonejs.com/guides/authentication).

## Table of Contents

- [GraphQL Access Control](#graphql-access-control)
  - [Defaults](#defaults)
  - [List level access control](#list-level-access-control)
    - [Access API](#access-api)
      - [Booleans](#booleans)
        - [Shorthand static Boolean](#shorthand-static-boolean)
        - [Granular static Booleans](#granular-static-booleans)
        - [Shorthand Imperative Boolean](#shorthand-imperative-boolean)
        - [Granular functions returning Boolean](#granular-functions-returning-boolean)
      - [GraphQLWhere](#graphqlwhere)
        - [Granular static GraphQLWheres](#granular-static-graphqlwheres)
        - [Granular functions returning GraphQLWhere](#granular-functions-returning-graphqlwhere)
  - [Field level access control](#field-level-access-control)
    - [access API](#access-api-1)
      - [Shorthand static Boolean](#shorthand-static-boolean-1)
      - [Granular static Booleans](#granular-static-booleans-1)
      - [Shorthand Imperative Boolean](#shorthand-imperative-boolean-1)
      - [Granular functions returning Boolean](#granular-functions-returning-boolean-1)

## GraphQL Access Control

There are two ways of specifying Access Control:

1. List level
2. Field level

### Defaults

To set defaults for all lists & fields, use the `defaultAccess` config when
creating a `Keystone` instance:

```js
const keystone = new Keystone('My App', {
  // Initial values shown here:
  defaultAccess: {
    list: true,
    field: true,
  },
  // ...
});
```

### List level access control

List level access control can have varying degrees of specificity depending on
how much control you need.

#### Access API

A key on the list config, `access` can be specified either as a single control,
covering all CRUD operations, or as an object keyed by CRUD operation names.

There are 3 ways to define the values of `access`, in order of flexibility:

1. Static
2. Imperative
3. Declarative

Described as a Flow type, it looks like this:

```js
type GraphQLWhere = {}; // fake/placeholder

type AccessInput = {
  authentication: {
    item?: {},
    listKey?: string,
  },
  originalInput?: {},
};

type StaticAccess = boolean;
type ImperativeAccess = AccessInput => boolean;
type DeclarativeAccess = GraphQLWhere | (AccessInput => GraphQLWhere);

type ListConfig = {
  access:
    | StaticAccess
    | ImperativeAccess
    | {
        create?: StaticAccess | ImperativeAccess,
        read?: StaticAccess | ImperativeAccess | DeclarativeAccess,
        update?: StaticAccess | ImperativeAccess | DeclarativeAccess,
        delete?: StaticAccess | ImperativeAccess | DeclarativeAccess,
      },
  // ...
};
```

`GraphQLWhere` matches the `where` clause on the GraphQl type.
ie; for a list `User`, it would match the input type `UserWhereInput`.

`AccessInput` function parameter

- `authentication` describes the currently authenticated user.
  - `.item` is the details of the current user. Will be `undefined` for anonymous users.
  - `.listKey` is the list key of the currently authenticated user. Will be `undefined` for anonymous users.
- `originalInput` for `create` & `update` mutations, this is the data as passed in the mutation.

When resolving `StaticAccess`;

- `true`: Allow access
- `false`: Do not allow access

Definition of `access` operations:

- `create`: Ability to create new items in the list
- `read`: Ability to view / fetch data on any items in the list
- `update`: Ability to alter data on any items in the list
- `delete`: Ability to remove an item from the list

When access is denied, the GraphQL response will contain an error with
`type: 'AccessDeniedError'`, and `null` for the data.

_Note_: The `create` operation cannot be given `DeclarativeAccess` - it does not
make sense to do so and will throw an error if attempted.

Let's break it down into concrete examples:

##### Booleans

###### Shorthand static Boolean

```js
keystone.createList('User', {
  access: true,

  fields: {
    // ...
  },
});
```

> Great for blanket access control for lists you want everyone/no one to see.

_NOTE:_ When set to `false`, the list queries/mutations/types will not be included in the GraphQL schema.

###### Granular static Booleans

```js
keystone.createList('User', {
  access: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },

  fields: {
    // ...
  },
});
```

> Use when you need some more fine grained control over what actions users can perform.

_NOTE:_ When set to `false`, the list queries/mutations/types exclusive to that
operation will not be included in the GraphQL schema. For example, setting
`create: false` will cause the `createXXXX` mutation to be excluded from the
schema, `update: false` will cause the `updateXXXX` mutation to be excluded, and
so on.

###### Shorthand Imperative Boolean

```js
keystone.createList('User', {
  access: ({ authentication: { item, listKey } }) => {
    return true;
  },

  fields: {
    // ...
  },
});
```

> Enables turning access on/off based on the currently authenticated user.

_NOTE:_ Even when returning `false`, the queries/mutations/types _will_ be
included in the GraphQL Schema.

###### Granular functions returning Boolean

```js
keystone.createList('User', {
  access: {
    create: ({ authentication: { item, listKey } }) => true,
    read: ({ authentication: { item, listKey } }) => true,
    update: ({ authentication: { item, listKey } }) => true,
    delete: ({ authentication: { item, listKey } }) => true,
  },

  fields: {
    // ...
  },
});
```

> Use when you need some more fine grained control over what actions some or all
> anonymous/authenticated users can perform.

_NOTE:_ Even when returning `false`,
the queries/mutations/types for that operation _will_ be included in the GraphQL Schema.
For example, `create: () => false` will still include the `createXXXX` mutation in the GraphQL Schema, and so on.

##### GraphQLWhere

In the examples below, the `name_contains: 'k'` syntax matches the `UserWhereInput` GraphQL type for the list.

_NOTES:_

1. For singular `read`/`update`/`delete` operations, when the `GraphQLWhere`
   clause results in 0 items, an `AccessDeniedError` is returned.
2. For batch `read` operations (eg; `query { allUsers }`), when the
   `GraphQLWhere` clause results in 0 items returned, no error is returned.
3. For `create` operations, an `AccessDeniedError` is returned if the operation
   is set to / returns `false`

###### Granular static `GraphQLWhere`s

```js
keystone.createList('User', {
  access: {
    create: true,
    read: { name_contains: 'k' },
    update: { name_contains: 'k' },
    delete: { name_contains: 'k' },
  },

  fields: {
    name: { type: Text },
    // ...
  },
});
```

> Use when you need some more fine grained control over what items a user can
> perform actions on.

###### Granular functions returning `GraphQLWhere`

```js
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
    // ...
  },
});
```

> Use when you need some more fine grained control over which items _and_
> actions anonymous/authenticated users can perform.

### Field level access control

#### access API

A key on the field config, `access` can be specified either as a single control,
covering all CRU operations, or as an object keyed by CRU operation names.

There are 2 ways to define the values of `access`, in order of flexibility:

1. Static
2. Imperative

Described as a Flow type, it looks like this:

```js
type AccessInput = {
  authentication: {
    item?: {},
    listKey?: string,
  },
  originalInput?: {},
  existingItem?: {},
};

type StaticAccess = boolean;
type ImperativeAccess = AccessInput => boolean;

type FieldConfig = {
  access:
    | StaticAccess
    | ImperativeAccess
    | {
        create?: StaticAccess | ImperativeAccess,
        read?: StaticAccess | ImperativeAccess,
        update?: StaticAccess | ImperativeAccess,
      },
  // ...
};
```

_NOTE:_ Unlike List level access, it is not possible to specify a Declarative
_where_ clause for Field level access.

_NOTE:_ Fields do not have a `delete` access controls - this control exists on
the list level only (it's not possible to _'delete'_ an existing field value -
only to modify it).

`AccessInput` function parameter

- `authentication` describes the currently authenticated user.
  - `.item` is the details of the current user. Will be `undefined` for anonymous users.
  - `.listKey` is the list key of the currently authenticated user. Will be `undefined` for anonymous users.
- `originalInput`is the data as passed in the mutation for `create` & `update` mutations (`undefined` for `read`).
- `existingItem` is the existing item this field belongs to for `update` mutations & `read` queries (`undefined` for `create`).

When defining `StaticAccess`;

- `true`: Allow access
- `false`: Do not allow access

Definition of `access` operations:

- `create`: Ability to set the value of the field when creating a new item
- `read`: Ability to view / fetch the value of this field on an item
- `update`: Ability to alter the value of this field on an item

When access is denied, the GraphQL response will contain an error with `type: 'AccessDeniedError'`,
and `null` for the field.

Let's break it down into concrete examples:

##### Shorthand static Boolean

```js
keystone.createList('User', {
  fields: {
    name: {
      type: Text,
      access: true,
    },
  },
});
```

> Great for blanket access control for fields you want everyone/no one to see.

_NOTE:_ When set to `false`, the list queries/mutations/types will not include
this field in the GraphQL schema.

##### Granular static Booleans

```js
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

> Use when you need some more fine grained control over what actions users can
> perform with this field.

_NOTE:_ When set to `false`, this field will not be included in GraphQL
queries/mutations/types exclusively used by that operation.
Eg, setting `update: false` in the example above will remove the `name` field from the
`UserUpdateInput` type but may still include the field in `UserCreateInput` for example.

##### Shorthand Imperative Boolean

```js
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

> Enables turning access on/off based on the currently authenticated user.

_NOTE:_ Even when returning `false`, the queries/mutations/types _will_
include the field in the GraphQL Schema.

##### Granular functions returning Boolean

```js
keystone.createList('User', {
  access: {
    create: ({ authentication: { item, listKey }, existingItem }) => true,
    read: ({ authentication: { item, listKey }, existingItem }) => true,
    update: ({ authentication: { item, listKey }, existingItem }) => true,
  },

  fields: {
    // ...
  },
});
```

> Use when you need some more fine grained control over what actions some or all
> anonymous/authenticated users can perform.

_NOTE:_ Even when returning `false`, this field _will_ be included in GraphQL
queries/mutations/types exclusively used by that operation.
Eg, setting `update: () => false` in the example above will still include the
`name` field in the `UserUpdateInput` type.
