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

Added `query` option to the Items API, replacing `resolveFields`.

`resolveFields` is now reserved for passing `false` when fields should not be resolved at all.

For example, to query a Post you would now write:

```js
const [post] = await lists.Post.findMany({
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

And to query for the raw data stored in the database, you would write:

```js
const [post] = await lists.Post.findMany({
  where: { slug },
  resolveFields: false,
});
```
