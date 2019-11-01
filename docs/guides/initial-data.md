<!--[meta]
section: guides
title: Adding initial data
subSection: setup
order: 3
[meta]-->

## Adding initial data to Lists

This guide will show you how to create a User list and add initial data to it using the `createItems` method. This process is also called `seeding`

First let's create a User list and add a `PasswordAuthStrategy`. Our `index.js` might look like this:

```javascript
const { Keystone, PasswordAuthStrategy } = require('@keystonejs/keystone');
const { Text, Checkbox, Password } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  name: 'example-project',
  adapter: new MongooseAdapter(),
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: { type: Checkbox },
    password: {
      type: Password,
    },
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({ enableDefaultRoute: true, authStrategy })],
};
```

You can achieve this setup by running the KeystoneJS CLI and selecting the `Starter` template.

This method's primary use is intended towards initial seeding of databases or running manual migration scripts.

### Usage

`createItems` requires an object where keys are list keys, and values are arrays of items to insert.
For example;

```javascript
keystone.createItems({
  User: [{ name: 'Ticiana' }, { name: 'Lauren' }],
  Post: [{ title: 'Hello World' }],
});
```

_Note_: The format of the data must match the schema setup with calls to `keystone.createList()`.

#### Relationships

It is possible to create relationships upon insertion by using the KeystoneJS
query syntax.

##### Single Relationships

For example;

```javascript
keystone.createItems({
  User: [{ name: 'Ticiana' }, { name: 'Lauren' }],
  Post: [
    {
      title: 'Hello World',
      author: { where: { name: 'Ticiana' } },
    },
  ],
});
```

The `author` field of the `Post` list would have the following configuration:

```javascript
keystone.createList('Post', {
  fields: {
    author: { type: Relationship, ref: 'User' },
  },
});
```

Upon insertion, KeystoneJS will resolve the `{ where: { name: 'Ticiana' } }` query
against the `User` list, ultimately setting the `author` field to the ID of the
_first_ `User` that is found.

_Note_: An error is thrown if no items match the query.

##### Many Relationships

When inserting an item with a `to-many` relationship, such as:

```javascript
keystone.createList('User', {
  fields: {
    posts: { type: Relationship, ref: 'Post', many: true },
  },
});
```

There is 2 ways to write the query for `to-many` relationships:

1. _Single Relation syntax_, using the same query as a Single Relationship, but
   instead of picking only the first item found, it will pick _all_ the items
   found to match the query. ie; 0, 1, or _n_ items.
2. _Array Relation syntax_, allowing to explicitly set the exact items related
   to. ie; The exact length and items in the collection.

**Single Relation syntax** example

```javascript
keystone.createItems({
  User: [{ name: 'Ticiana' }, { name: 'Lauren', posts: { where: { title_contains: 'React' } } }],
  Post: [
    { title: 'Hello Everyone' },
    { title: 'Talking about React' },
    { title: 'React is the Best' },
    { title: 'KeystoneJS Rocks' },
  ],
});
```

**Array Relation syntax** example

```javascript
keystone.createItems({
  User: [
    {
      name: 'Ticiana',
      posts: [
        // Notice the Array of queries
        { where: { title: 'Hello Everyone' } },
        { where: { title: 'KeystoneJS Rocks' } },
      ],
    },
    { name: 'Lauren' },
  ],
  Post: [
    { title: 'Hello Everyone' },
    { title: 'Talking about React' },
    { title: 'React is the Best' },
    { title: 'KeystoneJS Rocks' },
  ],
});
```

_NOTE: When using the Array Relation syntax, If any of the queries do not match
any items, an Error will be thrown._

---

The entire power of KeystoneJS Query Syntax is supported.

If you need to related to the 3rd item, you'd use a query like:

```javascript
keystone.createItems({
  User: [
    { name: 'Jed' },
    { name: 'Lauren' },
    { name: 'Jess' },
    { name: 'Lauren' },
    { name: 'John' },
  ],
  Post: [
    {
      title: 'Hello World',
      author: {
        where: {
          name_starts_with: 'J',
          skip: 2,
        },
      },
    },
  ],
});
```

Will match all users whose name starts with `'J'`, skipping the first two matches,
ultimately matching against `'John'`.

#### Errors

If an error occurs during insertion, data may be left in an inconsistent state.
We highly encourage you to take regular backups of your data, especially before
calling `createItems()`.

If an error occurs during the relationship resolution phase (see
_[Relationships](#relationships)_), any inserted items will be automatically
deleted for you, leaving the data in a consistent state.

#### Limitations & Advanced Inserts

`Keystone::createItems()` does not provide the full functionality that the
GraphQL endpoint does.

Limitations include:

- You cannot update existing items in the database
- You cannot delete existing items in the database

<!--
- You cannot insert items which have a required field of type `Relationship`
-->

When these limitations apply to your task at hand, we recommend using the
GraphQL API instead. It is more verbose, but much more powerful.
