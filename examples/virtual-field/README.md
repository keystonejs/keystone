## Feature Example - virtual field

This project demonstrates how to add virtual fields to a Keystone list
It builds on the [Blog](../blog) starter project.

## Instructions

To run this project, clone the Keystone repository locally then navigate to this directory and run:

```shell
yarn dev
```

This will start the Admin UI at [localhost:3000](http://localhost:3000).
You can use the Admin UI to create items in your database.

You can also access a Apollo Sandbox at [localhost:3000/api/graphql](http://localhost:3000/api/graphql), which allows you to directly run GraphQL queries and mutations.

## Features

This project demonstrates how to use virtual fields.
It uses the `graphql` export from `@keystone-next/keystone` to define the GraphQL schema used by the virtual fields.

### `isPublished`

The `isPublished` field shows how to use the `virtual` field to return some derived data.

```ts
isPublished: virtual({
  field: graphql.field({
    type: graphql.Boolean,
    resolve(item: any) {
      return item.status === 'published';
    },
  }),
}),
```

### `counts`

The `counts` field shows how to return a GraphQL object rather than a scalar from a virtual field.

```ts
counts: virtual({
  field: graphql.field({
    type: graphql.object<{ content: string }>()({
      name: 'PostCounts',
      fields: {
        words: graphql.field({
          type: graphql.Int,
          resolve({ content }) {
            return content.split(' ').length;
          },
        }),
        sentences: graphql.field({
          type: graphql.Int,
          resolve({ content }) {
            return content.split('.').length;
          },
        }),
        paragraphs: graphql.field({
          type: graphql.Int,
          resolve({ content }) {
            return content.split('\n\n').length;
          },
        }),
      },
    }),
    resolve(item: any) {
      return { content: item.content || '' };
    },
  }),
  ui: { query: '{ words sentences paragraphs }' },
}),
```

### `excerpt`

The `excerpt` field shows how to add GraphQL arguments to a virtual field.

```ts
excerpt: virtual({
  field: graphql.field({
    type: graphql.String,
    args: {
      length: graphql.arg({ type: graphql.nonNull(graphql.Int), defaultValue: 200 }),
    },
    resolve(item, { length }) {
      if (!item.content) {
        return null;
      }
      return (item.content as string).slice(0, length - 3) + '...';
    },
  }),
}),
```

### `relatedPosts`

The `relatedPosts` field shows how to use the GraphQL types defined by a Keystone list.

```ts
relatedPosts: virtual({
  field: lists =>
    graphql.field({
      type: graphql.list(graphql.nonNull(lists.Post.types.output)),
      resolve(item, args, context) {
        // this could have some logic to get posts that are actually related to this one somehow
        // this is a just a naive "get the three latest posts that aren't this one"
        return context.db.lists.Post.findMany({
          take: 3,
          where: { id_not: item.id, status: 'published' },
          orderBy: [{ publishDate: 'desc' }],
        });
      },
    }),
  ui: { query: '{ title }' },
}),
```
