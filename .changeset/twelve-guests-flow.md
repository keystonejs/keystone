---
'@keystone-next/fields': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Added support for filtering uniquely by text and integer fields that have `isUnique: true` like this:

```graphql
query {
  Post(where: { slug: "something-something-something" }) {
    id
    title
    content
  }
}
```
