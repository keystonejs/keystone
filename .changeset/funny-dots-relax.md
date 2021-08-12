---
'@keystone-next/fields': major
'@keystone-next/fields-document': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Updated filters to be nested instead of flattened and add top-level `NOT` operator. See the [Query Filter API docs](https://keystonejs.com/docs/apis/filters) and the upgrade guide for more information.

```graphql
query {
  posts(where: { title: { contains: "Something" } }) {
    title
    content
  }
}
```
