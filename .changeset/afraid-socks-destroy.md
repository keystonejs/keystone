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

Renamed `resolveFields` to `query` in the Items API.

`resolveFields` is now deprecated and will be removed in a future major version.

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
