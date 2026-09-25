---
title: 'Database'
description: "Keystone's database API is a programmatic API for running CRUD operations against the internal GraphQL resolvers in your system. It bypasses the GraphQL Server itself, invoking resolver functions directly."
---

The database API provides a programmatic API for running CRUD operations against the internal GraphQL resolvers in your system.
Importantly, this API bypasses the GraphQL Server itself, instead invoking the resolver functions directly.
The return values of this API are **internal item** objects, which are suitable to be returned from GraphQL resolvers.

This API executes the [`access control`](../guides/auth-and-access-control) rules and [`hooks`](../config/hooks) defined in your system.
To bypass these, you can directly use the Prisma Client at [`context.prisma`](../context/overview#database-access).

For each list in your system the following API is available at `context.db.<listName>`.

```
{
  findOne({ where: { id }, select }),
  findMany({ where, take, skip, orderBy, select }),
  count({ where }),
  createOne({ data, select }),
  createMany({ data, select }),
  updateOne({ where, data, select }),
  updateMany({ data, select }),
  deleteOne({ where, select }),
  deleteMany({ where, select }),
}
```

The arguments to these functions approximate their equivalent [GraphQL APIs](../graphql/overview).

### Selecting item fields

All `context.db` methods beside `count` accept a `select` object to pick particular columns to fetch. `id` is always fetched. Without `select`, these methods return the full item. Keystone may fetch additional fields needed by hooks or etc. that aren't specified in `select`.

```typescript
const posts = await context.db.Post.findMany({
  select: { title: true },
})
```

For a custom GraphQL resolver that returns the GraphQL output type for a list, use `getSelectionFromInfo` to include the columns needed by the requested GraphQL fields:

```typescript
import { getSelectionFromInfo } from '@keystone-6/core'

// Inside a resolver whose return type is Post or a list of Post items:
// info is the fourth arg passed to resolvers
return context.db.Post.findMany({
  select: getSelectionFromInfo(context, info, 'Post'),
})
```

You can also combine `getSelectionFromInfo` with columns that should always be loaded. The return type will reflect that e.g. `title` and `id` here will always be present but all other properties will be optional.

```typescript
const posts = await context.db.Post.findMany({
  select: { ...getSelectionFromInfo(context, info, 'Post'), title: true },
})
// posts[0].title is required; other Post columns are optional.
```

### findOne

```typescript
const user = await context.db.User.findOne({
  where: { id: '...' },
})
```

### findMany

```typescript
const users = await context.db.User.findMany({
  where: { name: { startsWith: 'A' } },
  take: 10,
  skip: 20,
  orderBy: [{ name: 'asc' }],
})
```

### count

```typescript
const count = await context.db.User.count({
  where: { name: { startsWith: 'A' } },
})
```

### createOne

```typescript
const user = await context.db.User.createOne({
  data: {
    name: 'Alice',
    posts: { create: [{ title: 'My first post' }] },
  },
})
```

### createMany

```typescript
const users = await context.db.User.createMany({
  data: [
    {
      name: 'Alice',
      posts: { create: [{ title: 'Alices first post' }] },
    },
    {
      name: 'Bob',
      posts: { create: [{ title: 'Bobs first post' }] },
    },
  ],
})
```

### updateOne

```typescript
const user = await context.db.User.updateOne({
  where: { id: '...' },
  data: {
    name: 'Alice',
    posts: { create: [{ title: 'My first post' }] },
  },
})
```

### updateMany

```typescript
const users = await context.db.User.updateMany({
  data: [
    {
      where: { id: '...' },
      data: {
        name: 'Alice',
        posts: { create: [{ title: 'Alices first post' }] },
      },
    },
    {
      where: { id: '...' },
      data: {
        name: 'Bob',
        posts: { create: [{ title: 'Bobs first post' }] },
      },
    },
  ],
})
```

### deleteOne

```typescript
const user = await context.db.User.deleteOne({
  where: { id: '...' },
})
```

### deleteMany

```typescript
const users = await context.db.User.deleteMany({
  where: [{ id: '...' }, { id: '...' }],
})
```

## Related resources

{% related-content %}
{% well
heading="Query API Reference"
href="/docs/context/query" %}
A programmatic API for running CRUD operations against your GraphQL API. For each list in your system you get an API at `context.query.<listName>`.
{% /well %}
{% well
heading="Context API Reference"
href="/docs/context/overview" %}
The API for run-time functionality in your Keystone system. Use it to write business logic for access control, hooks, testing, GraphQL schema extensions, and more.
{% /well %}
{% /related-content %}
