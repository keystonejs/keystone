---
'@keystone-next/keystone': major
'@keystone-next/types': major
'@keystone-next/admin-ui': major
---

Removed `adminMeta` from `KeystoneSystem`. `getAdminMetaSchema` now takes a `BaseKeystone` argument `keystone` rather than `adminMeta`.
