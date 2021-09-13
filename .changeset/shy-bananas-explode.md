---
'@keystone-next/keystone': major
---

Renamed `graphQLReturnFragment` to `ui.query` in the virtual field options. The virtual field now checks if `ui.query` is required for the GraphQL output type, and throws an error if it is missing. If you don't want want the Admin UI to fetch the field, you can set `ui.itemView.fieldMode` and `ui.listView.fieldMode` to `'hidden'` instead of providing `ui.query`.
