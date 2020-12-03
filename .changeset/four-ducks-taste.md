---
'@keystone-next/admin-ui': patch
'@keystone-next/auth': patch
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Removed `config` from type `KeystoneSystem`. The config object is now explicitly passed around where needed to make it clear which code is consuming it.
Type `KeystoneAdminUIConfig.getAdditionalFiles` now takes a `config` parameter. 