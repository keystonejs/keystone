---
'@keystone-next/keystone': major
---

The Admin UI will skip fetching fields that have a statically set `itemView.fieldMode: 'hidden'` on the item view. The `id` argument to the `KeystoneAdminUIFieldMeta.itemView` GraphQL field can now be omitted which will make `KeystoneAdminUIFieldMetaItemView.fieldMode` return null when there isn't a static field mode. The `itemView` also no longer uses a sudo context when fetching the item in the `KeystoneAdminUIFieldMetaItemView.fieldMode`. Previously, if someone had access to the Admin UI(`ui.isAccessAllowed`) and a field had a `itemView.fieldMode` function that used the `item` argument, someone could bypass access control to determine whether or not an item with a given id exists.
