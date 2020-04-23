<!--[meta]
section: guides
title: New schema cheatsheet
[meta]-->

# New schema cheatsheet

This cheatsheet summarises the changes needed to update your database to use the new Keystone database schema, introduced in the [`Arcade`](/docs/discussions/new-data-schema.md) release.
For full instructions please consult the [migration guide](/docs/guides/relationship-migration.md).

## One-to-many (one-sided)

```javascript
keystone.createList('User', { fields: { name: { type: Text } } });

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    author: { type: Relationship, ref: 'User', many: false },
  },
});
```

### Migration strategy

- No changes are required for these relationships.

## Many-to-many (one-sided)

```javascript
keystone.createList('User', { fields: { name: { type: Text } } });

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    authors: { type: Relationship, ref: 'User', many: true },
  },
});
```

### Migration Strategy

#### PostgreSQL

- Rename `Post_authors` to `Post_authors_many`.
- Rename `Post_id` to `Post_left_id` and `User_id` to `User_right_id`.

#### MongoDB

- Create a collection `post_authors_manies` with fields `Post_left_id` and `User_right_id`.
- Move the data from `posts.authors` into `post_authors_manies`.
- Delete `posts.authors`.

## One-to-many (two-sided)

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    posts: { type: Relationship, ref: 'Post.author', many: true },
  },
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    author: { type: Relationship, ref: 'User.posts', many: false },
  },
});
```

### Migration strategy

#### PostgreSQL

- Drop the `User_posts` table.

#### MongoDB

- Remove `users.posts`.

## Many-to-many (two-sided)

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    posts: { type: Relationship, ref: 'Post.authors', many: true },
  },
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    authors: { type: Relationship, ref: 'User.posts', many: true },
  },
});
```

### Migration strategy

#### PostgreSQL

- Drop the `Post_authors` table.
- Rename `User_posts` to `User_posts_Post_authors`.
- Rename `User_id` to `User_left_id` and `Post_id` to `Post_right_id`.

#### MongoDB

- Create a collection `user_posts_post_authors` with fields `User_left_id` and `Post_right_id`.
- Move the data from `users.posts` into `user_posts_post_authors`.
- Delete `users.posts`.
- Delete `posts.authors`.

## One-to-one (two-sided)

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

### Migration strategy

#### PostgreSQL

One to one relationships in the `before` state had a foreign key column on each table.
In the `after` state, only one of these is stored.
Because of the symmetry of the one-to-one relationship, Keystone makes an arbitrary decision about which column to use.

- Identify the foreign key column which is no longer required, and delete it.
- In our example above we would delete the `Post.author` column.

#### MongoDB

One to one relationships in the `before` state had a field in each collection.
In the `after` state, only one of these is stored.
Because of the symmetry of the one-to-one relationship, Keystone makes an arbitrary decision about which field to use.

- Identify the field which is no longer required, and delete it.
- In our example above we would delete the `post.author` field.
