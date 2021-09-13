---
'@keystone-next/keystone': major
---

Renamed `graphQLReturnFragment` to `ui.query` in the virtual field options and the virtual field now checks if for the GraphQL field you provided, you need to provide `ui.query`. If you don't want want the Admin UI fetch the field, you can set `ui.itemView.fieldMode` and `ui.listView.fieldMode` to `'hidden'` instead of providing `ui.query`.
