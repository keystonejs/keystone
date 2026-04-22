## Feature Example - Prisma Full-Text Search (PostgreSQL)

This project demonstrates how to use [Prisma's Full-Text Search](https://www.prisma.io/docs/v6/orm/prisma-client/queries/full-text-search) on PostgreSQL with Keystone, using `extendPrismaSchema` to enable the `fullTextSearchPostgres` preview feature and a custom GraphQL query to expose it.

> **Note:** This example requires a running PostgreSQL database. Full-text search is not available on SQLite.

## Instructions

To run this project, clone the Keystone repository locally then run `pnpm install` at the root of the repository.

Set your database URL:

```shell
export DATABASE_URL="postgresql://localhost/keystone-example"
```

Then navigate to this directory and run:

```shell
pnpm dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a GraphQL Playground at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

### Enabling Full-Text Search with `extendPrismaSchema`

Prisma's `fullTextSearchPostgres` is a [preview feature](https://www.prisma.io/docs/v6/orm/reference/preview-features/client-preview-features) that must be explicitly enabled in the Prisma generator block. Since Keystone manages the `schema.prisma` file automatically, you can inject this using `extendPrismaSchema` in your Keystone config:

```typescript
db: {
  provider: 'postgresql',
  extendPrismaSchema: schema => {
    return schema.replace(
      /(generator [^}]+)}/g,
      ['$1', '  previewFeatures = ["fullTextSearchPostgres"]', '}'].join('\n')
    )
  },
}
```

This produces a generator block like:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres"]
}
```

### Custom `searchPosts` Query

Prisma's `search` operator is a low-level Prisma feature not yet surfaced through Keystone's `context.db` query layer. To use it, the example reaches for the raw Prisma client via `context.prisma`, then converts the results back to Keystone-typed objects using `context.db`:

```typescript
// 1. Use raw Prisma client to perform the full-text search
const matches = await context.prisma.post.findMany({
  where: {
    OR: [{ title: { search: query } }, { content: { search: query } }],
  },
  select: { id: true },
})

// 2. Fetch proper Keystone Post objects using the matched IDs
const ids = matches.map(p => p.id)
return context.db.Post.findMany({ where: { id: { in: ids } } })
```

### PostgreSQL Full-Text Search Syntax

The `query` argument accepts PostgreSQL's tsquery syntax:

| Operator | Meaning          | Example                                                 |
| -------- | ---------------- | ------------------------------------------------------- |
| `&`      | AND              | `"cat & dog"` — must contain both                       |
| `\|`     | OR               | `"cat \| dog"` — must contain either                    |
| `!`      | NOT              | `"!cat"` — must not contain                             |
| `<->`    | Phrase/proximity | `"fox <-> dog"` — "dog" follows immediately after "fox" |

### Try it in the GraphQL Playground

After creating some posts in the Admin UI, open [localhost:3000/api/graphql](http://localhost:3000/api/graphql) and run:

```graphql
query {
  searchPosts(query: "keystone & graphql") {
    id
    title
    content
    author {
      name
    }
  }
}
```

## Try it out in CodeSandbox 🧪

You can play with this example online in a web browser using the free [codesandbox.io](https://codesandbox.io/) service. To launch this example, open the URL <https://githubbox.com/keystonejs/keystone/tree/main/examples/extend-full-text-search>. You can also fork this sandbox to make your own changes.
