---
'@keystone-next/fields': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Added support for filtering uniquely by text and integer fields like this:

```graphql
query {
  Post(where: { slug: "something-something-something" }) {
    id
    title
    content
  }
}
```
