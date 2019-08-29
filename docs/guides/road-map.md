<!--[meta]
section: road-map
title: Road Map
order: 1
draft: true
[meta]-->

# Roadmap

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
independently of the access control options (but access control still governs
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
