<!--[meta]
section: discussions
title: Relationships
[meta]-->

# Relationships

Keystone allows you to model your data as a collection of related `Lists`.
For example, a blogging application might have lists called `Post` and `User`, where each post has a single author.
This would be represented in Keystone by a relationship between the `Post` and `User` lists.

## Defining a relationship

Relationships are implemented using the `Relationship` field type and defined along with other fields in `createLists`.
For our blog example, we could define:

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

The `Relationship` field type takes a config option `ref` which is able to reference another list in the application.
In this case, the `author` field will hold a reference to the `User` list.

If we wanted to allow a post to have multiple authors we could change our definition to

```javascript
    authors: { type: Relationship, ref: 'User', many: true },
```

We have used `many: true` to indicate that the post relates to multiple `Users`, who are the `authors` of that post.
The default configuration is `many: false`, which indicates that each post is related to exactly one user.

### One-sided vs two-sided

In our example we know the authors of each post.
We can access this information from our GraphQL API by querying for the `authors` field of a post.

```graphql
Query {
  allPosts {
    title
    content
    authors {
      name
    }
  }
}
```

If we can find all `authors` of a post, this implies there is enough information available to find all posts written by a particular user.
To access to this information from the `Users` list as well, we update our list definitions as such:

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

We have now added a `posts` field to the `User` list, and changed the `ref` config of the `authors` field.
We now have two `Relationship` fields, but importantly, we still **only have one relationship**.
The two fields simply represent different sides of the one relationship.

This type of configuration is called a _two-sided_ relationship, while the original configuration without `posts` was a _one-sided_ relationship.

We can now write the following query to find all the posts written by each user:

```graphql
Query {
  allUsers {
    name
    posts {
      title
      content
    }
  }
}
```

There are some important things to remember when defining a two-sided relationship:

- Even though there are two fields, there is only one relationship between the lists.
- The `ref` config must be formatted as `<listName>.<fieldName>` and both sides must refer to each other.
- Both fields are sharing the same data. If you change the author of a post, that post will no longer show up in the original author's `posts`.

## Self-referential lists

In the above examples we defined relationships between two different lists, `Users` and `Posts`.
It is also possible to define relationships which refer to the same list.
For example if we wanted to implement a Twitter style following relationship we could define:

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    follows: { type: Relationship, ref: 'User', many: true },
  },
});
```

This one-sided relationship allows us to keep track of who each user is following.
We could turn this into a two-sided relationship to also access the followers of each user:

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    follows: { type: Relationship, ref: 'User.followers', many: true },
    followers: { type: Relationship, ref: 'User.follows', many: true },
  },
});
```

The only relationship configuration not currently supported is having a field reference _itself_, e.g. `friends: { type: Relationship, ref: 'User.friends', many: true }`.

## Cardinality

The _cardinality_ of a relationship is the number items which can exist on either side of the relationship.
In general, each side can have either `one` or `many` related items.
Since each relationship has two sides this means we can have `one-to-one`, `one-to-many` and `many-to-many` relationships.

The cardinality of your relationship is controlled by the use of the `many` config option.
In two-sided relationships the `many` option on both sides must be considered.
The follow examples will demonstrate how to set up each type of cardinality in the context of our blog.

### One-sided

#### One-to-many

Each post has a single author, and each user can have multiple posts, however we cannot directly access a users' posts.

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

#### Many-to-many

Each post has multiple authors, and each user can have multiple posts, however we cannot directly access a users' posts.

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

### Twos-sided

#### One-to-one

Each post has a single author, and each user is only allowed to write one post.

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

#### One-to-many

Each post has a single author, and each user can have multiple posts.

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

#### Many-to-many

Each post can have multiple authors, and each user can have multiple posts.

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

## Summary

Keystone relationships are managed using the `Relationship` field type.
They can be configured as one-sided or two-sided by the `ref` config option, and the cardinality can be set using the `many` flag.
If you need help deciding which options to use, please consult the [relationship configuration guide](/docs/guides/relationships.md).
