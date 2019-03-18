---
section: packages
title: Keystone
---

# Keystone

## `Keystone` class

### `Keystone::createItems(<items>)`

Allows programatically creating a batch of items described as JSON objects.

This method's primary use is indended for migration scripts, or initial seeding
of databases.

#### `items`

An object where keys are list keys, and values are arrays of items to insert.
For example;

```javascript
keystone.createItems({
  User: [{ name: 'Ticiana' }, { name: 'Lauren' }],
  Post: [{ title: 'Hello World' }],
});
```

> The format of the data must match the schema setup with calls to
> `keystone.createList()`.

#### Relationships

It is possible to create relationships upon insertion by using the Keystone
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

Upon insertion, Keystone will resolve the `{ where: { name: 'Ticiana' } }` query
against the `User` list, ultimately setting the `author` field to the ID of the
_first_ `User` that is found.

Note an error is thrown if no items match the query.

##### Many Relationships

When inserting an item with a to-many relationship, such as:

```javascript
keystone.createList('User', {
  fields: {
    posts: { type: Relationship, ref: 'Post', many: true },
  },
});
```

There is 2 ways to write the relationship query:

1.  _Single Relation syntax_, using the same query as a Single Relationship, but
    instead of picking only the first item found, it will pick _all_ the items
    found to match the query. ie; 0, 1, or _n_ items.
2.  _Array Relation syntax_, allowing to explicitly set the exact items related
    to. ie; The exact length and items in the collection.

**Single Relation syntax** example

```javascript
keystone.createItems({
  User: [{ name: 'Ticiana' }, { name: 'Lauren', posts: { where: { title_contains: 'React' } } }],
  Post: [
    { title: 'Hello Everyone' },
    { title: 'Talking about React' },
    { title: 'React is the Best' },
    { title: 'Keystone Rocks' },
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
        { where: { title: 'Keystone Rocks' } },
      ],
    },
    { name: 'Lauren' },
  ],
  Post: [
    { title: 'Hello Everyone' },
    { title: 'Talking about React' },
    { title: 'React is the Best' },
    { title: 'Keystone Rocks' },
  ],
});
```

_NOTE: When using the Array Relation syntax, If any of the queries do not match
any items, an Error will be thrown._

---

The entire power of Keystone Query Syntax is supported.

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

Will match all users whos name starts with `'J'`, skipping the first two matches,
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
