---
'@keystone-next/keystone': major
---

The Admin UI will skip fetching fields that have a statically set `itemView.fieldMode: 'hidden'` on the item view. The `id` argument to the `KeystoneAdminUIFieldMeta.itemView` GraphQL field can now be omitted which will make `KeystoneAdminUIFieldMetaItemView.fieldMode` return null when there isn't a static field mode.
