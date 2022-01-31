---
'@keystone-6/core': minor
---

The return types of `context.query` methods are now types based on the GraphQL return types rather than being `Record<string, any>`. Note all fields are optional because the types do not know what fields were selected in the `query` field.
