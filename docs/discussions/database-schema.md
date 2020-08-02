<!--[meta]
section: discussions
title: Database schema
[meta]-->

# Database schema

Keystone models its data using `Lists`, which comprise of `Fields`.
In order to store data we need to translate the Keystone data model into an appropriate form for the underlying data store.
This transformation is handled by the [database adapters](/docs/quick-start/adapters.md).

This transformation is generally reasonably simple.
A `List` called `User` in Keystone will have table called `Users` in PostgreSQL or a collection called `users` in MongoDB.
For most field types there is also a one to to correspondence between a Keystone `Field` and a PostgreSQL column or MongoDB field.
Each field type is responsible for articulating the exact correspondence, which includes the storage types and any auxiliary data that needs to be stored.

The most complicated aspect of the database schema is the representation of relationships.
To understand the storage of relationships you should first make sure you understand the basic ideas behind [Keystone relationships](/docs/discussions/relationships.md).

## One-to-many

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    author: { type: Relationship, ref: 'User', many: false },
  },
});
```

If we consider the above `one-to-many` relationship we know that each `Post` has a single `author` of type `User`.
This means that we `Post` needs to store a reference to a single `User`.

In PostgreSQL this is stored as a [foreign key column](https://www.postgresql.org/docs/12/ddl-constraints.html#DDL-CONSTRAINTS-FK) called `author` on the `Posts` table,
In MongoDB it is stored as a field called `author` on the `posts` collection with type `ObjectID`.

The two-sided cases is handled identically to the one-sided case.

## Many-to-many

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    authors: { type: Relationship, ref: 'User', many: true },
  },
});
```

If we consider the above `many-to-many` relationship we know that each `Post` has multiple `authors` of type `User`.
This means that `Post` needs to store multiple references to `Users`, and also each `User` can be referenced by multiple `Posts`.

To store this information we use a join table with two columns.
One column holds a reference to `Posts` and the other holds a reference to `Users`.
In PostgreSQL this is implemented as a table where the contents of each column is a [foreign key](https://www.postgresql.org/docs/12/ddl-constraints.html#DDL-CONSTRAINTS-FK) referencing the respective table.

In MongoDB this is implemented as a collection where the contents of each field is an `ObjectID` referencing the respective [document](https://docs.mongodb.com/manual/core/document/). The above many-to-many example would result in a collection named `post_authors_manies` with a joining document of this format:

```javascript
{
  "_id": ObjectID,
  "Post_left_id": ObjectID,
  "User_right_id": ObjectID,
}
```

The two-sided cases is handled using the same pattern, however the generated table/collection and column/fields names will be different.

## One-to-one

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    post: { type: Relationship, ref: 'Post.author', many: false },
  },
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    author: { type: Relationship, ref: 'User.post', many: false },
  },
});
```

If we consider the above `one-to-one` relationship we know that each `Post` has a single `author`, and each `User` is the author of a single `Post`.
This is similar to the `one-to-many` case, however now because of the symmetry of the configuration it is possible to store the data on either the `Post` or `User` table.

To break this symmetry we pick the list with the name that comes first alphabetically, so in this case `Post`.
Just as in the `one-to-many` case, in PostgreSQL the data is stored as a [foreign key column](https://www.postgresql.org/docs/12/ddl-constraints.html#DDL-CONSTRAINTS-FK) called `author` on the `Posts` table.
In MongoDB it is stored as a field called `author` on the `posts` collection with type `ObjectID`.
