---
'@keystonejs/fields': major
'@keystonejs/keystone': major
'@keystonejs/api-tests': patch
'@keystonejs/demo-custom-fields': patch
---

Hooks no longer recieve a `{ query }` argument. This functionality has been superseded by `context.executeGraphQL()`.

```
{
  ...
  hooks: {
    resolveInput: async ({ actions: { query } } ) => {
      ...
      const { data, errors } = await query(`{ ... }`);
      ...
    }
  }
}
```

should be changed to

```
{
  ...
  hooks: {
    resolveInput: async ({ context } ) => {
      ...
      const { data, errors } = await context.executeGraphQL({ query: `{ ... }` });
      ...
    }
  }
}
```

See [the docs](/docs/discussions/server-side-graphql.md) for more details on how to use `context.executeGraphQL()`.
