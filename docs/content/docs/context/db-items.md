---
title: "Database"
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
  findOne({ where: { id } }),
  findMany({ where, take, skip, orderBy }),
  count({ where }),
  createOne({ data }),
  createMany({ data }),
  updateOne({ where, data }),
  updateMany({ data }),
  deleteOne({ where }),
  deleteMany({ where }),
}
```

The arguments to these functions approximate their equivalent [GraphQL APIs](../graphql/overview).

### Compound unique selectors

[`db.unique`](../config/lists#indexes-and-compound-unique-constraints) declarations add [compound selectors](../graphql/overview#compound-unique-selectors) to `context.db`, just as they do to `context.query` and GraphQL:

```typescript
const where = { slug_domain: { slug: '/de/about', domain: 'example.com' } };
const page = await context.db.Page.findOne({ where });
await context.db.Page.updateOne({ where, data: { name: 'About' } });
const nextPages = await context.db.Page.findMany({
  cursor: where,
  orderBy: [{ slug: 'asc' }, { domain: 'asc' }],
  skip: 1,
  take: 20,
});
await context.db.Page.deleteOne({ where });
```

Use the complete, non-null tuple wherever a unique selector is accepted, including bulk mutations and relationship inputs.
The generated types retain the member input types without making the members individually unique.
Unlike raw Prisma calls, these operations still apply Keystone access control and field filtering restrictions.
Compound selectors are not added to ordinary `findMany.where` filters.

### findOne

```typescript
const user = await context.db.User.findOne({
  where: { id: '...' },
});
```

### findMany

```typescript
const users = await context.db.User.findMany({
  where: { name: { startsWith: 'A' } },
  take: 10,
  skip: 20,
  orderBy: [{ name: 'asc' }],
});
```

### count

```typescript
const count = await context.db.User.count({
  where: { name: { startsWith: 'A' } },
});
```

### createOne

```typescript
const user = await context.db.User.createOne({
  data: {
    name: 'Alice',
    posts: { create: [{ title: 'My first post' }] },
  },
});
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
});
```

### updateOne

```typescript
const user = await context.db.User.updateOne({
  where: { id: '...' },
  data: {
    name: 'Alice',
    posts: { create: [{ title: 'My first post' }] },
  },
});
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
});
```

### deleteOne

```typescript
const user = await context.db.User.deleteOne({
  where: { id: '...' },
});
```

### deleteMany

```typescript
const users = await context.db.User.deleteMany({
  where: [{ id: '...' }, { id: '...' }],
});
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
