---
'@keystone-next/keystone': major
---

Id field filters no longer allow `null` to be passed because ids can never be null. For the `in` and `not_in`, this is reflected in the GraphQL types
