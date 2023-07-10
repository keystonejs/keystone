---
title: "Query"
description: "Reference docs for Keystone‘s Query API: a programmatic API for running CRUD operations against your GraphQL API."
---

The Query API provides a programmatic API for running CRUD operations against your GraphQL API.
For each list in your system the following API is available at `context.query.<listName>`.

```
{
  findOne({ where: { id }, query }),
  findMany({ where, take, skip, orderBy, query }),
  count({ where }),
  createOne({ data, query }),
  createMany({ data, query }),
  updateOne({ where: { id }, data, query }),
  updateMany({ data, query }),
  deleteOne({ where: { id }, query }),
  deleteMany({ where, query }),
}
```

The arguments to these functions closely correspond to their equivalent GraphQL APIs, making it easy to switch between the programmatic API and the GraphQL API.

The `query` argument (which defaults to `'id'`), is a string which indicates which fields should be returned by the operation.

The functions in the API work by directly executing queries and mutations against your GraphQL API.

### findOne

```typescript
const user = await context.query.User.findOne({
  where: { id: '...' },
  query: 'id name posts { id title }',
});
```

### findMany

```typescript
const users = await context.query.User.findMany({
  where: { name: { startsWith: 'A' } },
  take: 10,
  skip: 20,
  orderBy: [{ name: 'asc' }],
  query: 'id name posts { id title }',
});
```

### count

```typescript
const count = await context.query.User.count({
  where: { name: { startsWith: 'A' } },
});
```

### createOne

```typescript
const user = await context.query.User.createOne({
  data: {
    name: 'Alice',
    posts: { create: [{ title: 'My first post' }] },
  },
  query: 'id name posts { id title }',
});
```

### createMany

```typescript
const users = await context.query.User.createMany({
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
  query: 'id name posts { id title }',
});
```

### updateOne

```typescript
const user = await context.query.User.updateOne({
  where: { id: '...' },
  data: {
    name: 'Alice',
    posts: { create: [{ title: 'My first post' }] },
  },
  query: 'id name posts { id title }',
});
```

### updateMany

```typescript
const users = await context.query.User.updateMany({
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
  query: 'id name posts { id title }',
});
```

### deleteOne

```typescript
const user = await context.query.User.deleteOne({
  where: { id: '...' },
  query: 'id name posts { id title }',
});
```

### deleteMany

```typescript
const users = await context.query.User.deleteMany({
  where: [{ id: '...' }, { id: '...' }],
  query: 'id name posts { id title }',
});
```

## Related resources

{% related-content %}
{% well
heading="Context API Reference"
href="/docs/context/overview" %}
The API for run-time functionality in your Keystone system. Use it to write business logic for access control, hooks, testing, GraphQL schema extensions, and more.
{% /well %}
{% well
heading="DB API Reference"
href="/docs/context/db-items" %}
The API for running CRUD operations against the internal GraphQL resolvers in your system. It returns internal item objects, which can be returned from GraphQL resolvers.
{% /well %}
{% /related-content %}
