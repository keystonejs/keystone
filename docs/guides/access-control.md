<!--[meta]
section: guides
title: Access Control
subSection: advanced
[meta]-->

# Access Control Guide

> Control who can do what with your GraphQL API.

## Intro

What a user _can_ and _cannot_ do in KeystoneJS depends on two things: _authentication_ and _access control_.

This guide focuses on the GraphQL API _access control_, which refers to the specific actions an authenticated or anonymous user can take.

_Authentication_, on the other hand, refers to a user identifying themselves in the Admin UI. You can learn about it in the [Authentication guide](/guides/authentication).

## GraphQL Access Control

Access control is about limiting CRUD (Create, Read, Update, Delete) actions that can be performed based on the current user (authenticated or anonymous).

In KeystoneJS, both [Lists](/api/create-list) and [Fields](keystone-alpha/fields) take an `access` option, which lets you define rules of access control with fine precision - see [Access Control API](/api/access-control) docs for more details.

### Example

Let's assume we want set the following access controls for a `User` list:

1. Only admins can _read_ deactivated user accounts.
2. Only authenticated users can _read/update_ their own email, not any other user's. Admins can _read/update_ anyone's email.
3. Only admins can see if a password is set. No-one can read their own or other
   user's passwords.
   - _NOTE: It is **never** possible in KeystoneJS to read a password via the
     Admin UI or the API)_
4. Only authenticated users can update their own password. Admins can update
   anyone's password.

Here's how we would set that up:

_NOTE: The code below depends on having a correct [authentication setup](/guides/authentication)._

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

Note that Jess can only read _his own_ email, and cannot read any passwords.

---

Read more in the [Access Control API docs](https://v5.keystonejs.com/api/access-control).
