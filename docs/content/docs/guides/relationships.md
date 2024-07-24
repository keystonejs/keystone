---
title: Understanding Relationships
description: >-
  Learn how to reason about and configure relationships in Keystone so you can
  bring value to your project through structured content.

---
Relationships are the connections you make between different lists of content in Keystone. What you build depends a great deal on what you need. This guide will show you how to reason about, and configure relationships in Keystone so you can bring value to your project through structured content.

---

## How to reason about relationships

Keystone provides a lot of flexibility when it comes to relationships. To get what you need there are two key questions you need to answer:

1. **Which side of the relationship do I need to access data from?**

Your needs here will define whether your relationship needs to be [one, or two-sided](#one-sided-and-two-sided-relationships).

1. **How many connections do I need on either side of my relationship?**

Understanding this will determine the kind of [cardinality](#establishing-cardinality) you need to configure.

These topics are easier to understand by example. We’ll explore them, as well as the basics of setting up relationships through the use case of a **blog app** that has a `post` type for blog entries, and `user` type for post authors. Let’s get started…

## How to define a relationship in Keystone

Relationships are made using the [`relationship`](../fields/relationship) field type within a [`list()`](../config/lists). In our blog example we can connect a blog `post` to some `users` using the relationship field’s `ref` configuration option like so:

```typescript{11}
import { config, list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({ fields: { name: text() } }),
    Post: list({
      fields: {
        title: text(),
        content: text(),
        authors: relationship({ ref: 'User', many: true, }),
      },
    }),
  },
});
```

{% hint kind="tip" %}
The `many` config option relates to *cardinality* which we explore later
{% /hint %}

## One-sided & two-sided relationships

In Keystone it’s possible to define relationships from one, or both sides of the two lists you’re connecting. We refer to these as *one-sided*, and *two-sided* relationships:

### One-sided

Our example above is one-sided: the `Post` list relates to the `User` list via the `authors` field. This kind of relationship will let us query for the `authors` of a post in our GraphQL API like so:

```graphql
query {
  posts {
    title
    content
    authors {
      name
    }
  }
}
```

### Two-sided

If we can find all the `authors` of a post, we can also find all the posts written by a particular user. To do this we need to configure a two-sided relationship in our schema:

```typescript{9-10,17-18}[1-3]
import { config, list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
        // relates posts to authors
        posts: relationship({ref: 'Post.authors', many: true }),
      },
    }),
    Post: list({
      fields: {
        title: text(),
        content: text(),
        // relates authors to posts
        authors: relationship({ ref: 'User.posts', many: true }),
      },
    }),
  },
});
```

In the example above we added a `posts` field to the `User` list, and changed the `ref` config of the `authors` field to be `User.posts`.

{% hint kind="tip" %}
In a two-sided relationship the `ref` config must be formatted as `<listName>.<fieldName>` and both sides must refer to each other.
{% /hint %}

Now that our relationship is two-sided we can query all the posts written by each user like so:

```graphql
query {
  users {
    name
    posts {
      title
      content
    }
  }
}
```

{% hint kind="warn" %}
**Things to keep in mind:**

Two-sided relationships are declared in two places, but **there is only one relationship between both lists**.

**Both fields share the same data**. If you change the author of a post, that post will no longer show up in the original author’s posts.
{% /hint %}

### Self-referencing relationships

Keystone also lets you define one, and two-sided **relationships that refer to the same list**. To make a *one-sided* Twitter style following relationship we do the following:

```typescript{9}[1-3]
import { config, list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
        follows: relationship({ ref: 'User', many: true }),
      },
    }),
  },
});
```

Or change this into a *two-sided* relationship to also access the followers of every user:

```typescript{9-10}[1-3]
import { config, list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
        follows: relationship({ ref: 'User.followers', many: true }),
        followers: relationship({ ref: 'User.follows', many: true }),
      },
    }),
  },
});
```

{% hint kind="tip" %}
The only relationship configuration not currently supported is having a field reference itself, e.g. `friends: relationship({ ref: 'User.friends', many: true })`.
{% /hint %}

## Establishing cardinality

*Cardinality* is a term used to describe how many items can exist on either side of a relationship. Each side can have either `one` or `many` related items. Since each relationship can have one and two sides, we have the following options available:

{% table %}
- Relationship type
- One to one
- One to many
- Many to many
---
- One-sided
- {% emoji symbol="❌" alt="Not supported" /%}
- {% emoji symbol="✅" alt="Supported" /%}
- {% emoji symbol="✅" alt="Supported" /%}
---
- Two-sided
- {% emoji symbol="✅" alt="Supported" /%}
- {% emoji symbol="✅" alt="Supported" /%}
- {% emoji symbol="✅" alt="Supported" /%}
{% /table %}

Cardinality is defined through the `relationship` field’s `many` configuration option. It’s a boolean where:

- `false` = one
- `true` = many

{% hint kind="tip" %}
`false` is the default state for the many config option.
{% /hint %}

Let’s explore how to set up each type of cardinality in the context of our blog:

### One-sided cardinalities

#### One-to-many {% #one-sided-one-to-many %}

- Posts have a single author
- Users can have multiple posts

```typescript{15}[1-3]
import { config, list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
      },
    }),
    Post: list({
      fields: {
        title: text(),
        content: text(),
        author: relationship({ ref: 'User', many: false }),
      },
    }),
  },
});
```

#### Many-to-many {% #one-sided-many-to-many %}

- Posts can have multiple authors
- Users can have multiple posts

```typescript{15}[1-3]
import { config, list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
      },
    }),
    Post: list({
      fields: {
        title: text(),
        content: text(),
        authors: relationship({ ref: 'User', many: true }),
      },
    }),
  },
});
```

### Two-sided cardinalities

{% hint kind="warn" %}
In two-sided relationships the `many` option on both sides must be considered.
{% /hint %}

#### One-to-one

- Posts have a single author
- Users can create only one post

```typescript{9,16}[1-3]
import { config, list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
        post: relationship({ ref: 'Post.author', many: false }),
      },
    }),
    Post: list({
      fields: {
        title: text(),
        content: text(),
        author: relationship({ ref: 'User.post', many: false }),
      },
    }),
  },
});
```

#### One-to-many {% #two-sided-one-to-many %}

- Posts have a single author
- Users can have multiple posts

```typescript{9,16}[1-3]
import { config, list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
        posts: relationship({ref: 'Post.author', many: true }),
      },
    }),
    Post: list({
      fields: {
        title: text(),
        content: text(),
        author: relationship({ ref: 'User.posts', many: false }),
      },
    }),
  },
});
```

{% hint kind="tip" %}
Note that we’ve used `many: false` in the author field and `many: true` in the posts field.
{% /hint %}

#### Many-to-many {% #two-sided-many-to-many %}

- Posts can have multiple authors
- Users can have multiple posts

```typescript{9,16}[1-3]
import { config, list } from '@keystone-6/core';
import { text, relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    User: list({
      fields: {
        name: text(),
        posts: relationship({ ref: 'Post.authors', many: true }),
      },
    }),
    Post: list({
      fields: {
        title: text(),
        content: text(),
        authors: relationship({ ref: 'User.posts', many: true }),
      },
    }),
  },
});
```

{% hint kind="tip" %}
Note that we have used `many: true` in both the authors and posts fields.
{% /hint %}

## Summary

Keystone relationships are managed using the [relationship](../fields/relationship) field type. They can be configured as one-sided or two-sided by the `ref` config option. Their cardinality can be set using the `many` flag. Keystone gives you the flexibility to choose what you want based on what you need to achieve.

## Related resources

{% related-content %}
{% well
   heading="Relationship Field API Reference"
   grad="grad1"
   href="/docs/fields/relationship"
   target="" %}
Defines the names, types, and configuration of Keystone fields. See all the fields and the configuration options they accept.
{% /well %}
{% /related-content %}
