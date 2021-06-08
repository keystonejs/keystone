---
'@keystone-next/fields': major
---

The relationship field now returns a `[Item!]` instead of a `[Item!]!`, this is so that if an error occurs when resolving the related items, only the relationship field will be returned as null rather than the whole item being returned as null.
