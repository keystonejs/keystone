---
'@keystone-next/document-renderer': major
---

The value of `data` passed to the inline relationship renderer now matches the data returned by the GraphQL query.
Falsey values of `data.label` are no longer set to `data.id` and falsey values of `data.data` are no longer set to `{}`.
