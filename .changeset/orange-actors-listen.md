---
'@keystonejs/keystone': major
---

Resolver functions for custom queries and mutations no longer recieve a `{ query }` argument. This functionality has been superseded by `context.executeGraphQL()`.

```
keystone.extendGraphQLSchema({
  queries: {
    schema: '...',
    resolver: async (item, args, context, info, { query }) => {
      ...
      const { data, errors } = await query(`{ ... }`);
      ...
    }
  }
});
```

should be changed to

```
keystone.extendGraphQLSchema({
  queries: {
    schema: '...',
    resolver: async (item, args, context) => {
      ...
      const { data, errors } = await context.executeGraphQL({ query: `{ ... }` });
      ...
    }
  }
});
```

See [the docs](/docs/discussions/server-side-graphql.md) for more details on how to use `context.executeGraphQL()`.
