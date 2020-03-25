<!--[meta]
section: tutorials
title: Seeding data
order: 3
[meta]-->

# Seeding data

This guide will show you how to create a `User` list and add initial data to it
using the `createItems` method. This process is also called `seeding`.

> **Note:** In a previous chapter the code was split up over separate files, while this is preferred in a real code base, in this part everything is put in one file for clarity reasons.

## List setup

### Install packages

This chapter will use a different `User` schema than previous chapters and instead
of a `Todo` list, there will be a `Post` list. It is best to start from a fresh
project and start from an empty database (delete data from previous chapters).
Also, make sure to have all of the following packages installed:

```bash
yarn add @keystonejs/keystone
yarn add @keystonejs/adapter-mongoose
yarn add @keystonejs/app-graphql
yarn add @keystonejs/fields
yarn add @keystonejs/app-admin-ui
yarn add @keystonejs/auth-password
```

### Preparation

First let's create a `User` list and add a `PasswordAuthStrategy`. The code in `index.js`:

```javascript
const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
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

> **Hint**: A similar setup can be achieved by running the Keystone CLI `yarn create keystone-app` and selecting `Starter (Users + Authentication)`. This starter project has a `User` list, `PasswordAuthStrategy` and seeding of the database already configured. For now, we will proceed manually.

## Creating items

The `createItems` method requires an object where keys are list keys, and values
are arrays of items to insert. For example:

```javascript
keystone.createItems({
  User: [
    { name: 'John Duck', email: 'john@duck.com', password: 'dolphins' },
    { name: 'Barry', email: 'bartduisters@bartduisters.com', password: 'dolphins' },
  ],
});
```

> **Note**: The format of the data must match the schema setup with calls to `keystone.createList()`. As an example in our schema the `email` field has `isUnique: true`, therefor it would not be possible for the above code to have the same email for each user that should be generated.

Example on how to `seed` the data upon database connection:

```javascript
const keystone = new Keystone({
  name: 'New Project',
  adapter: new MongooseAdapter(),
  onConnect: async keystone => {
    await keystone.createItems({
      User: [
        { name: 'John Duck', email: 'john@duck.com', password: 'dolphins' },
        { name: 'Barry', email: 'bartduisters@bartduisters.com', password: 'dolphins' },
      ],
    });
  },
});
```

Start the application and visit the Admin UI, two users are available on startup.

> **Note**: In this example the same two users would be generated _every_ startup. Since email should be unique this will cause a duplicate error to show up. To avoid this, clear the database before starting Keystone.

## Relationships

It is possible to create relationships between items while seeding the database
by using the Keystone query syntax.

### Single relationships

Add the `Relationship` field to the imports:

```javascript
const { Text, Checkbox, Password, Relationship } = require('@keystonejs/fields');
```

Create a list with a relationship to another list:

```javascript
keystone.createList('Post', {
  fields: {
    title: {
      type: Text,
    },
    author: {
      type: Relationship,
      ref: 'User',
    },
  },
});
```

Example on how to seed an item with a relationship:

```javascript
Post: [
  {
    title: 'Hello World',
    author: { where: { name: 'John Duck' } },
  },
],
```

The full example:

```javascript
const keystone = new Keystone({
  name: 'New Project',
  adapter: new MongooseAdapter(),
  onConnect: async keystone => {
    await keystone.createItems({
      User: [
        { name: 'John Duck', email: 'john@duck.com', password: 'dolphins' },
        { name: 'Barry', email: 'bartduisters@bartduisters.com', password: 'dolphins' },
      ],
      Post: [
        {
          title: 'Hello World',
          author: { where: { name: 'John Duck' } },
        },
      ],
    });
  },
});
```

Upon insertion, Keystone will resolve the `{ where: { name: 'John Duck' } }` query
against the `User` list, ultimately setting the `author` field to the ID of the
_first_ `User` that is found.

> **Note**: An error is thrown if no items match the query.

Clear the database, then start Keystone and visit the Admin UI to see that two users are generated and one post is generated. The post has an `author` named `John Duck`. In the database `author` will be the ID of the user with name John Duck.

### Many relationships

A user can have many posts, add the `to-many` relationship field `posts` to the `User`:

```javascript
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
    posts: {
      type: Relationship,
      ref: 'Post',
      many: true,
    },
  },
});
```

There are two ways to write the query for `to-many` relationships:

1. _Single Relation syntax_ uses the same query as a Single Relationship, but
   instead of picking only the first item found, it will pick _all_ the items
   found to match the query. This could be 0, 1, or _n_ items.
2. _Array Relation syntax_ allows to explicitly set multiple queries to match.

#### Single relation syntax example

To get all posts where the `title` field contains the word `React`:

```javascript
posts: {
  where: {
    title_contains: 'React';
  }
}
```

In action:

```javascript
const keystone = new Keystone({
  name: 'New Project',
  adapter: new MongooseAdapter(),
  onConnect: async keystone => {
    await keystone.createItems({
      User: [
        {
          name: 'John Duck',
          email: 'john@duck.com',
          password: 'dolphins',
          posts: { where: { title_contains: 'React' } },
        },
        {
          name: 'Barry',
          email: 'bartduisters@bartduisters.com',
          password: 'dolphins',
          isAdmin: true,
        },
      ],
      Post: [
        { title: 'Hello Everyone' },
        { title: 'Talking about React' },
        { title: 'React is the Best' },
        { title: 'KeystoneJS Rocks' },
      ],
    });
  },
});
```

Clear the database, start the Keystone application and visit the Admin UI. Take a look at the user `John Duck`, he has two posts associated with him (there were two posts with the word `React` in the `title`).

#### Array relation syntax example

```javascript
const keystone = new Keystone({
  name: 'New Project',
  adapter: new MongooseAdapter(),
  onConnect: async keystone => {
    await keystone.createItems({
      User: [
        {
          name: 'John Duck',
          email: 'john@duck.com',
          password: 'dolphins',
          posts: { where: { title_contains: 'React' } },
        },
        {
          name: 'Barry',
          email: 'bartduisters@bartduisters.com',
          password: 'dolphins',
          isAdmin: true,
        },
      ],
      Post: [
        { title: 'Hello Everyone' },
        { title: 'Talking about React' },
        { title: 'React is the Best' },
        { title: 'KeystoneJS Rocks' },
      ],
    });
  },
});
```

> **Note:** When using the Array Relation syntax, If any of the queries do not match any items, an Error will be thrown.

Clear the database, start Keystone and visit the Admin UI. Take a look at both users, they each now have two posts associated with them. `John Duck` has the posts that contain `React` in the title. `Barry` has the posts that matched any of the queries in the array.

> **Note:** When looking at the posts, there are _no_ associated users! To have both the user associated with the post as well is called `back reference`, this will be handled in a later chapter.

## Keystone query syntax

The entire power of [Keystone Query Syntax](https://www.keystonejs.com/guides/intro-to-graphql#filter-limit-and-sorting) is supported.

If you need the 3rd item that matches the query, you'd use a query like:

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

This will match all users whose name starts with `'J'`, skipping the first two matches,
ultimately matching against `'John'`.

## Error handling

If an error occurs during insertion, data may be left in an inconsistent state.
We highly encourage you to take regular backups of your data, especially before
calling `createItems()`.

If an error occurs during the relationship resolution phase (see
_[Relationships](#relationships)_), any inserted items will be automatically
deleted for you, leaving the data in a consistent state.

## Limitations

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
