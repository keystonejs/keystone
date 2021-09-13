---
'@keystone-next/keystone': major
---

Removed `defaultValue` and the undocumented `withMeta` option from the `relationship` field. To re-create `defaultValue`, you can use `resolveInput` though note that if you're using autoincrement ids, you need to return the id as number, not a string like you would provide to GraphQL, e.g. `{ connect: { id: 1 } }` rather than `{ connect: { id: "1" } }`. If you were using `withMeta: false`, please open an issue with your use case.
