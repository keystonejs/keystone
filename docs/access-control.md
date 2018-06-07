# Access Control

There are 4 ways of effecting the available actions of a user in Keystone:

1. Admin UI authentication
2. Admin UI display & forms
3. GraphQL access control
4. Schema isolation

*Note on terminology*:
- _Authentication_ refers to a user identifying themselves. The specifics of how
  this is done is outside the scope of this document.
- _Access Control_ refers to the specific actions an authenticated or anonymous
  user can take. Often referred to as _authorization_ elsewhere.

## Admin UI authentication

TODO: Docs on how to login to the Admin UI

NOTE: Authentication 

## Admin UI display & forms

You are able to control which fields are available within the Admin UI
indpendently of the access control options (but access control still governs
the final data displayed / mutated, see _[GraphQL access control](#graphql-access-control)_).

Given a list configured like so:

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Email },
    password: { type: Password },
  }
});
```

You can add an `admin` config to change what fields are displayed in the Admin
UI, like so:

```javascript
function getAdminUiFields(authenticated) {
  if (isSuperUser(authenticated)) {
    return true; // All fields are available
  }

  return ['name', 'email', 'password'];// Only some fields are available
}

keystone.createList('User', {
  fields: { /* ... */ },
  admin: {
    fields: (authenticated) => getAdminUiFields(authenticated),
  },
});
```

The above is a shorthand for:

```javascript
function getAdminUiFields(authenticated) {
  /* ... */
}

keystone.createList('User', {
  fields: { /* ... */ },
  admin: {
    fields: {
      create: (authenticated) => getAdminUiFields(authenticated),
      read: (authenticated) => getAdminUiFields(authenticated),
      update: (authenticated) => getAdminUiFields(authenticated),
    }
  },
});
```

> `true` is shorthand for 'all access allowed',
> and `false` is shorthand for 'no access allowed'.
> These shorthands also provide performance benefits over function based access
> checks.

<details>
 <summary>Complete example</summary>

```javascript
function isSuperUser(authenticated) {
  return authenticated.role === 'su';
}

function getAdminUiFields(authenticated) {
  if (isSuperUser(authenticated)) {
    return true; // All fields are available
  }

  return ['name', 'email', 'password'];// Only some fields are available
}

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Email },
    password: { type: Password },
  }
  admin: {
    fields: {
      create: (authenticated) => getAdminUiFields(authenticated),
      read: (authenticated) => getAdminUiFields(authenticated),
      update: (authenticated) => getAdminUiFields(authenticated),
    }
  },
});
```

---
</details>

## GraphQL access control

Access control is about limiting CRUD actions that can be performed based on the
access level of the currently authenticated (or anonymous) user.

When combined with [Admin UI display & forms](#admin-ui-display-forms), it is
possible to display fields, while limiting the data.

For example, the below access control states:
- Only authenticated users can read/update their own email, not any other
  user's.
- Only authenticated users can update their own password, they cannot read their
  own or other user's passwords.
- Display only the fields `name`, `email`, `password` in the Admin UI

```javascript
function getAdminUiFields(authenticated) {
  if (isSuperUser(authenticated)) {
    return true; // All fields are available
  }

  return ;// Only some fields are available
}

keystone.createList('User', {
  fields: {
    name: { type: Text },
    address: { type: Text },
    email: {
      type: Email,
      access: ({ item, authentication }) => item.id === authentication.id,
    },
    password: {
      type: Password,
      access: {
        read: false,
        update: ({ item, authentication }) => item.id === authentication.id,
      }
    },
  }
  admin: {
    fields: ['name', 'email', 'password'],
  },
});
```

When logged in as "Jess", will result in a list view like:

| name         | email                 | password |
|--------------|-----------------------|----------|
| Jed Watson   |                       |          |
| Jess Telford | jess@thinkmill.com.au |          |
| John Molomby |                       |          |

Notice Jess can only read his own email, and cannot read any passwords. Also
notice the address column is not shown (as it wasn't included in the `admin`
config).

### `access` API

When specifying access values, the following are equivalent:

**Shorthand Boolean Format**

```javascript
access: true
```

Great for blanket access control for lists or fields.

**Regular Boolean Format**

```javascript
access: {
  create: true,
  read: true,
  update: true,
  delete: true
}
```

Statically set access control for specific actions.

**Dynamic Format**

```javascript
access: {
  create: (args) => true,
  read: (args) => true,
  update: (args) => true,
  delete: (args) => true,
}
```
_(The definition of `args` changed depending on list / field usage, see below
for more)_


#### Lists

The following are equivalent:

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Email },
  },
  access: {
    read: false,
    update: false,
  }
});
```

```javascript
keystone.createList('User', {
  fields: {
    name: {
      type: Text
      access: {
        read: false,
        update: false,
      }
    },
    email: {
      type: Email,
      access: {
        read: false,
        update: false,
      }
    },
  },
});
```

##### Default value

The default value for lists is:

```javascript
access: {
  create: true,
  read: true,
  update: true,
  delete: true
}
```

##### Dynamic format

The function set on the access control types have the following signature:

```
({ item<Object>, authorisation<Object>: { item<Object>, listKey<String> }}) => Boolean
```

- `item` is the list item being checked against
- `authorisation.item` is the authenticated user. Will be `undefined` for
  anonymous users.
- `authorisation.listKey` can be used to lookup the list by name. Will be
  `undefined` for anonymous users.

##### `create`

The ability for a user to create new items in the list.

When set explicitly to `false`, the `createXXXX` mutation will not be included
in the GraphQL schema.

When set to a function, and that function returns `false`, the `createXXXX`
mutation will continue to appear in the GraphQL schema, and any usage of that
mutation will return an Access Denied error.

##### `read`

Ability to query for values via GraphQL.

When set explicitly to `false`, queries for this list (and meta data) will not
appear in the GraphQL schema.

When set to a function, and that function returns `false`, this list will
continue to appear in the GraphQL schema, and any queries for items from this
list will return `null`.

##### `update`

The ability for a user to update existing items in the list.

When set explicitly to `false`, the `updateXXXX` mutation will not be included
in the GraphQL schema.

When set to a function, and that function returns `false`, the `updateXXXX`
mutation will continue to appear in the GraphQL schema, and any usage of that
mutation will return an Access Denied error.

##### `delete`

The ability for a user to delete existing items in the list.

When set explicitly to `false`, the `deleteXXXX` mutation will not be included
in the GraphQL schema.

When set to a function, and that function returns `false`, the `deleteXXXX`
mutation will continue to appear in the GraphQL schema, and any usage of that
mutation will return an Access Denied error.

#### Fields

Fields do not have `create` or `delete` access controls - these controls exist
on the list level only.

##### Default value

Default values for `read`/`update` are taken from the field's list.

##### Dynamic format

The function set on the access control types have the following signature:

```
({ item<Object>, listKey<String> }) => Boolean
```

- `item` is the authenticated user. Will be `undefined` for anonymous users.
- `listKey` can be used to lookup the list by name. Will be `undefined` for
  anonymous users.

##### `read`

Ability to include the value of this field in queries.

When set explicitly to `false`, this field will not be included in the GraphQL
schema.

When set to a function, and that function returns `false`, this field will
continue to appear in the GraphQL schema, and any queries which use it will have
a value of `null`.

##### `update`

The ability for a user to update the valueof this field.

When set explicitly to `false`, the `updateXXXX` mutation will not contain this
field as an input.

When set to a function, and that function returns `false`, the `updateXXXX`
mutation will continue to contain the field in the GraphQL schema, and any
attempt to write to that field will return an Access Denied error.

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

```javascript
{
  // Set the default value for all lists with a root level `access` option
  // Takes the same form as the `access` option on lists
  access: true,

  // Configure individual lists
  lists: {
    // Lists are identified by the name passed to `.createList()`
    <listKey>: {
      // Set access config for this list. Note: This also changes the 'default'
      // for any fields which don't have explicit values set
      // Takes the same form as the `access` option on lists
      access: {
        create: true,
        read: true,
        update: true,
        delete: true,

        // Overwite access config for specific fields
        fields: {

          // Overwrite the `.createList()` config to give full CRUD access for
          // admin
          email: true,
          password: true,
        }
      }
    }
  }
}
```

### Schema Isolation Examples

#### Role based schemas

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    address: { type: Text },
    email: {
      type: Email,
      access: ({ item, authentication }) => item.id === authentication.id,
    },
    password: {
      type: Password,
      access: {
        read: false,
        update: ({ item, authentication }) => item.id === authentication.id,
      }
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
        }
      }
    }
  }
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

---

## Access Control Queries

It is also possible to determine access control of the current user via queries:

```graphq
query {
  _Permissions(where: { list: "User" }) {
    create
    read
    update
    delete
  }
  
  # Will throw an error if the user does not have access to 'read' the User list
  _UserPermissions(where: { id: "abc123" }) {
    name: {
      read
      update
    }
    email: {
      read
      update
    }
  }
}
```

This can be useful for clients to construct views around the given user's access to fields and lists.

<!-- TODO: Flesh this out more -->
