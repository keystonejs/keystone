---
section: discussion
title: Access Control
---

# Access Control Guide

> Control who can do what with your GraphQL API.

## Intro

There are 2 ways of effecting the available actions of a user in Keystone:

1.  Admin UI authentication
2.  GraphQL access control

Note on Terminology:

- _Authentication_ refers to a user identifying themselves.
  The specifics of how this is done is outside the scope of this document.
  Within this document, we abbreviate _Authentication_ to _Auth_.
  See [Authentication](../authentication.md) for more.
- _Access Control_ refers to the specific actions an authenticated or anonymous
  user can take. Often referred to as _authorization_ elsewhere.

## Admin UI Authentication

See [Authentication](../authentication.md).

## GraphQL Access Control

Access control is about limiting CRUD (Create, Read, Update, Delete) actions that can be performed based on the
access level of the currently authenticated (or anonymous) user.

For example, the below access control states:

1.  Only admins can read deactivated user accounts.
2.  Only authenticated users can read/update their own email, not any other
    user's. Admins can read/update anyone's email.
3.  Only admins can see if a password is set. No-one can read their own or other
    user's passwords.
    - _NOTE: It is **never** possible in Keystone to read a password via the
      Admin UI or the API)_
4.  Only authenticated users can update their own password. Admins can update
    anyone's password.

_NOTE: The code below depends on having a correct [authentication setup](../authentication.md)._

```javascript
const { Text, Select, Checkbox, Password } = require('@keystone-alpha/fields');

const keystone = // ...

// Setup the Authentication Strategy.
// See https://v5.keystonejs.com/guides/authentication for more
const authStrategy = // ...

keystone.createList('User', {
  access: {
    // 1. Only admins can read deactivated user accounts
    read: ({ authentication: { item } }) => {
      if (item.isAdmin) {
        return {}; // Don't filter any items for admins
      }
      // Approximately; users.filter(user => user.state !== 'deactivated');
      return {
        state_not: 'deactivated',
      };
    },
  },
  fields: {
    name: { type: Text },
    address: { type: Text },
    state: {
      type: Select,
      options: ['active', 'deactivated'],
      defaultValue: 'active',
    },
    isAdmin: { type: Checkbox, defaultValue: false },
    email: {
      type: Text,
      // 2. Only authenticated users can read/update their own email, not any other user's. Admins can read/update anyone's email.
      access: ({ existingItem, authentication }) => (
        authentication.item.isAdmin
        || existingItem.id === authentication.item.id
      ),
    },
    password: {
      type: Password,
      access: {
        // 3. Only admins can see if a password is set. No-one can read their own or other user's passwords.
        read: ({ authentication }) => authentication.item.isAdmin,
        // 4. Only authenticated users can update their own password. Admins can update anyone's password.
        update: ({ existingItem, authentication }) => (
          authentication.item.isAdmin
          || existingItem.id === authentication.item.id
        ),
      },
    },
  },
});
```

When logged in to the Admin UI as "Jess", will result in a list view like:

| name    | email                 | password | state  |
| ------- | --------------------- | -------- | ------ |
| Ticiana |                       |          | active |
| Jess    | jess@thinkmill.com.au |          | active |
| Lauren  |                       |          | active |

Notice Jess can only read his own email, and cannot read any passwords.

---

Read more in the [Access Control API docs](../../guides/access-control.md).
