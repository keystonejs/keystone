---
'@keystonejs/keystone': major
'@keystonejs/app-graphql': patch
---

Removed `Keystone.getAdminSchema` in favour of a new `Keystone.getResolvers({ schemaName })` method, along with the pre-existing `Keystone.getTypeDefs({ schemaName })`.
