<!--[meta]
section: api
title: Access Control
[meta]-->

# Access Control API

Control who can do what with your GraphQL API.

_Note: This is the API documentation for Access Control. For getting started,
see the [Access Control Guide](../discussions/access-control.md) or the
[Authentication Guide](../discussions/authentication.md)._

## Table of Contents

- - [GraphQL Access Control](#graphql-access-control)

    - [Defaults](#defaults)

    - [List level access control](#list-level-access-control)

      - [access API](#access-api)

        - [Booleans](#booleans)

          - [Shorthand static Boolean](#shorthand-static-boolean)
          - [Granular static Booleans](#granular-static-booleans)
          - [Shorthand Imperative Boolean](#shorthand-imperative-boolean)
          - [Granular functions returning Boolean](#granular-functions-returning-boolean)

        - [GraphQLWheres](#graphqlwheres)

          - [Granular static GraphQLWheres](#granular-static-graphqlwheres)
          - [Granular functions returning GraphQLWhere](#granular-functions-returning-graphqlwhere)

    - [Field level access control](#field-level-access-control)

      - [access API](#access-api-1)

        - [Shorthand static Boolean](#shorthand-static-boolean-1)
        - [Granular static Booleans](#granular-static-booleans-1)
        - [Shorthand Imperative Boolean](#shorthand-imperative-boolean-1)
        - [Granular functions returning Boolean](#granular-functions-returning-boolean-1)

- [Roadmap](#roadmap)

  - [Admin UI authentication](#admin-ui-authentication)

  - [Admin UI display & forms](#admin-ui-display--forms)

    - [true/false](#truefalse)
    - [Array of field names to allow access to](#array-of-field-names-to-allow-access-to)
    - [A function which receives an auth object and returns either 1. or 2.](#a-function-which-receives-an-auth-object-and-returns-either-1-or-2)

  - [GraphQL access control](#graphql-access-control-1)

  - [Access Control Queries](#access-control-queries)

  - [Schema isolation](#schema-isolation)

    - [createGraphQLMiddleware(config) => function(req, res, next)](#creategraphqlmiddlewareconfig--functionreq-res-next)

    - [Schema Isolation Examples](#schema-isolation-examples)

      - [Role based schemas](#role-based-schemas)

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

#### `access` API

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

_NOTE_: The `create` operation cannot be given `DeclarativeAccess` - it does not
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

##### `GraphQLWhere`s

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

#### `access` API

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
  existingItem: {},
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
- `existingItem` is the existing item this field belongs to (undefined on create).

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

---

# Roadmap

> The above documents the current state of Access Control in Keystone.
> Below, we outline one possible roadmap for enhancing Access Control in the
> future.
>
> _**NOTE**: This is a draft, and should not be considered final._

2 additional ways of effecting the available actions of a user in Keystone:

1. Admin UI authentication
2. _New:_ Admin UI display & forms
3. GraphQL access control
4. _New:_ Schema isolation

## Admin UI authentication

As above

## Admin UI display & forms

You are able to control which fields are available within the Admin UI
indpendently of the access control options (but access control still governs
the final data displayed / mutated, see _[GraphQL access control](#graphql-access-control)_).

Given a list configured like so:

```js
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Email },
    password: { type: Password },
  },
});
```

You can add an `admin` config to change what fields are displayed in the Admin
UI, like so:

```js
function getAdminUiFields(auth) {
  if (isSuperUser(auth)) {
    return true; // All fields are available
  }

  return ['name', 'email', 'password']; // Only some fields are available
}

keystone.createList('User', {
  fields: {
    /* ... */
  },
  admin: {
    createFields: auth => getAdminUiFields(auth),
    readFields: auth => getAdminUiFields(auth),
    updateFields: auth => getAdminUiFields(auth),
  },
});
```

There are 3 ways to define the fields, in increasing levels of verbosity:

1. `true` for 'all access allowed' / `false` for 'no access allowed'
2. An array of field names to allow access to
3. A function which receives an `auth` object and returns either 1. or 2.

NOTE: When creating a list item, any fields not specified in `createFields` will
use the field's default value. If no default value is set, an error will be thrown.

### `true`/`false`

```js
keystone.createList('User', {
  fields: {
    /* ... */
  },
  admin: {
    createFields: false, // no access allowed to create list items
    readFields: true, // full access allowed to read all fields of a list item
    updateFields: true, // full access allowed to update any field in a list item
  },
});
```

### Array of field names to allow access to

```js
keystone.createList('User', {
  fields: {
    /* ... */
  },
  admin: {
    createFields: ['name', 'email', 'password'], // can set only these fields when creating
    readFields: ['name', 'email'], // Only these fields are visible when reading
    updateFields: ['email'], // Only `email` can be updated
  },
});
```

### A function which receives an `auth` object and returns either 1. or 2.

```js
keystone.createList('User', {
  fields: {
    /* ... */
  },
  admin: {
    // below, admin gets super access
    createFields: auth => (auth.item.isAdmin ? true : ['name', 'email', 'password']),
    readFields: auth => (auth.item.isAdmin ? true : ['name', 'email']),
    updateFields: auth => (auth.item.isAdmin ? true : ['email']),
  },
});
```

<details>
 <summary>Complete example</summary>

```js
function isSuperUser(auth) {
  return auth.role === 'su';
}

function getAdminUiFields(auth) {
  if (isSuperUser(auth)) {
    return true; // All fields are available
  }

  return ['name', 'email', 'password']; // Only some fields are available
}

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Email },
    password: { type: Password },
    address: { type: Text },
  },
  admin: {
    createFields: auth => getAdminUiFields(auth),
    readFields: auth => getAdminUiFields(auth),
    updateFields: auth => getAdminUiFields(auth),
  },
});
```

---

</details>

## GraphQL access control

When combined with [Admin UI display & forms](#admin-ui-display--forms), it is
possible to display fields, while limiting the data.

For example, the below access control states:

- Only authenticated users can read/update their own email, not any other
  user's.
- Only authenticated users can update their own password, they cannot read their
  own or other user's passwords.
- Display only the fields `name`, `email`, `password` in the Admin UI

```js
function getAdminUiFields(auth) {
  if (isSuperUser(auth)) {
    return true; // All fields are available
  }
  return; // Only some fields are available
}

keystone.createList('User', {
  fields: {
    name: { type: Text },
    address: { type: Text },
    email: {
      type: Email,
      access: ({ existingItem, auth }) => existingItem.id === auth.id,
    },
    password: {
      type: Password,
      access: {
        read: false,
        update: ({ existingItem, auth }) => existingItem.id === auth.id,
      },
    },
  },
  admin: {
    createFields: ['name', 'email', 'password'],
    readFields: ['name', 'email', 'password'],
    updateFields: ['name', 'email', 'password'],
  },
});
```

When logged in as "Jess", will result in a list view like:

| name         | email                 | password |
| ------------ | --------------------- | -------- |
| Jed Watson   |                       |          |
| Jess Telford | jess@thinkmill.com.au |          |
| John Molomby |                       |          |

Notice Jess can only read his own email, and cannot read any passwords. Also
notice the address column is not shown (as it wasn't included in the `admin`
config).

---

## Access Control Queries

It is also possible to determine access control of the current user via queries:

```graphql
query {
  _allUsersMeta(where: { id: "abc123" }) {
    access: {
      create
      read
      update
      delete

      fields: {
        name: {
          create
          read
          update
        }
        email: {
          create
          read
          update
        }
        // ..etc
      }
    }
  }
}
```

This can be useful for clients to construct views around the given user's access to fields and lists.

<!-- TODO: Flesh this out more -->

## Schema isolation

By default, Keystone generates a single GraphQL endpoint with an
include-by-default approach to what schema is available.

In some cases (see [examples](#schema-isolation-examples) below), it is
desirable to have an entirely separate schema available at different endpoints
or to different users.

<!-- TODO @jed: Insert links to discussions on security through obscurity & privacy of
certain fields, etc -->

<!-- TODO @jed: How does this fit in with the Admin UI? How can a new Admin UI
be generated based on a given schema? -->

### `createGraphQLMiddleware(config) => function(req, res, next)`

Keystone exposes a `.createGraphQLMiddleware()` function which generates an
express middleware you can then add to a route to serve your graphql api.

`config` takes the form:

```js
var config = {
  // Set the default value for all lists with a root level `access` option
  // Takes the same form as the `access` option on lists
  access: true,

  // Configure individual lists
  lists: {
    // Lists are identified by the name passed to `.createList()`
    [listKey]: {
      // Set access config for this list.
      // Takes the same form as the `access` option on lists
      access: {
        create: true,
        read: true,
        update: true,
        delete: true,

        // Overwite access config for specific fields
        fields: {
          // Overwrite the `.createList()` config to give full CRU access for
          // admin
          email: true,
          password: true,
        },
      },
    },
  },
};
```

### Schema Isolation Examples

#### Role based schemas

```js
keystone.createList('User', {
  fields: {
    name: { type: Text },
    address: { type: Text },
    email: {
      type: Email,
      access: ({ existingItem, auth }) => existingItem.id === auth.id,
    },
    password: {
      type: Password,
      access: {
        read: false,
        update: ({ existingItem, auth }) => existingItem.id === auth.id,
      },
    },
  },
});

// This schema assumes if you can hit the route, then you have god-mode.
const adminSchema = keystone.createGraphQLMiddleware({
  // grant access to everything by default, however is not enough to overwrite
  // the specific rules setup in the above `.createList()`
  access: true,
  lists: {
    // Overrides for specific fields
    User: {
      access: {
        fields: {
          // Overwrite the `.createList()` config to give full CRUD access for
          // admin
          email: true,
          password: true,
        },
      },
    },
  },
});

const publicSchema = keystone.createGraphQLMiddleware();

app.use('/graphql', (req, res, next) => {
  // Assuming req.user is set by some earlier authentication middleware
  if (req.user.role === 'ADMIN') {
    return adminSchema(req, res, next);
  }
  publicSchema(req, res, next);
});
```
