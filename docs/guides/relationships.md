<!--[meta]
section: guides
title: Configuring relationships
[meta]-->

# Configuring relationships

Keystone allows you to model your data by declaring [relationships](/docs/discussions/relationships.md) between lists.
There are a number of different ways you can configure relationships, depending on how you want to model your data and how you need to access it from the graphQL API.
This guide will step you through the decision making process to help you get all your configurations just right.

Throughout this guide we will use the example of a blog application which has `Users` and `Posts`.

## One-sided vs two-sided

A relationship in Keystone exists _between_ two lists.
In our blog, the concept of _authorship_ (who wrote a post) can be represented as a relationship between the `User` and the `Post` lists.

The first question you need to consider is which list do you want to be able to access the relationship from in your graphQL API?
In our blog we might want to be able to ask about a `user's posts`, a `post's author`, or possibly both.
If you only need to access one side of the relationship then you want to configure a _one-sided_ relationship. If you need both, then you want to configure a _two-sided_ relationship.

Let's assume that each post in our blog has a single author and look at how we would use the `ref` option to configure both a one-sided and two-sided relationship.

### One-sided

If we want to know who the author of a post is, but we're not interested in querying for all the posts written by a given user we can set up a one-sided relationship as follow:

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

In the `author` field we have specified `ref: 'User'` to indicate that this field relates to an item in the `User` list.
We can now write the following query to find the author for each post:

```graphql
Query {
  allPosts {
    title
    content
    author {
      name
    }
  }
}
```

### Two-sided

If we also want to access all the posts written by a user then we need to use a two-sided relationship.

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

In this case we have a `Relationship` field on both lists, and they both have a `ref` config in the form `<listName>.<fieldName>`.
These `Relationship` fields represent the two sides of the relationship, and we can now use the following graphQL query as well:

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

## Cardinality

The second question we need to ask is what the _cardinality_ of our relationship should be.
The _cardinality_ of a relationship is the number items which can exist on either side of the relationship.
In our blog do we want each post to have exactly one author, or can it have multiple authors?
Are users allowed to write more than one post or do we want to restrict them to exactly one post each for some reason?
The answers to these questions will give us the cardinality of our relationship.

There are three types of cardinality, `one-to-many`, `many-to-many`, and `one-to-one`, and they can be configured using the `many` config option.

### One-to-many

If we want a blog where each post can have **one** author, and each user can be the author of **many** posts, then we have a `one-to-many` relationship.
We can configure a one-sided version of this:

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

or a two-sided version:

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

Note that we have used `many: false` in the `author` field and `many: true` in the `posts` field.

### Many-to-many

If we want a blog where each post can have **many** authors, and each user can be the author of **many** posts, then we have a `many-to-many` relationship.
We can configure a one-sided version of this:

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

or a two-sided version:

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

Note that we have used `many: true` in both the `authors` and `posts` fields.

### One-to-one

If we want a blog where each post has exactly **one** author, and each user is restricted to writing exactly **one** post, then we have a `one-to-one` relationship.
In this case we can only specify this with a two-sided relationship:

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

Note that we have used `many: false` in both the `authors` and `posts` fields.

## Summary

When configuring a relationship in Keystone there are two key questions you need to answer:

- Do I want a one-sided or two-sided relationship?
- What is the cardinality of my relationship?

Once you know the answers to these questions you can configure your relationship using the `ref` and `many` options.
