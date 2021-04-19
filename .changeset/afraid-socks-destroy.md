---
"@keystone-next/api-tests-legacy": patch
"@keystone-next/example-ecommerce": patch
"@keystone-next/example-next-lite": patch
"@keystone-next/admin-ui": patch
"@keystone-next/auth": patch
"@keystone-next/keystone": minor
"@keystone-next/types": minor
"@keystone-next/website": patch
---

With the goal of making the Lists API (i.e `context.lists.{List}`) more intuitive to use, the `resolveFields` option has been deprecated in favor of two new methods:

(1) You can specify a string of fields to return with the new `query` option, when you want to query for resolved field values (including querying relationships and virtual fields). This replaces the `resolveFields: false` use case.

For example, to query a Post you would now write:

```js
const [post] = await context.lists.Post.findMany({
  where: { slug },
  query: `
    title
    content
    image {
      src
      width
      height
    }`,
});
```

(2) Alternatively, there is a new set of APIs on `context.db.lists.{List}` which will return the unresolved item data from the database (but with read hooks applied), which can then be referenced directly or returned from a custom mutation or query in the GraphQL API to be handled by the Field resolvers. This replaces the `resolveFields: boolean` use case.

For example, to query for the raw data stored in the database, you would write:

```js
const [post] = await context.db.lists.Post.findMany({
  where: { slug }
});
```
