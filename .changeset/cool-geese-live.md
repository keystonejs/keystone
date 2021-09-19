---
'@keystone-next/keystone': major
---

The `KeystoneAdminUIFieldMeta.isOrderable` and `KeystoneAdminUIFieldMeta.isFilterable` fields are no longer statically resolvable and will now take into account the context/session. This also means `isOrderable` and `isFilterable` are no longer accessible on `useList().fields[fieldKey].isOrderable/isFilterable`, they can be fetched through GraphQL if you need them in the Admin UI.
