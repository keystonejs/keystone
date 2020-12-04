---
'@keystone-next/admin-ui': major
'@keystone-next/keystone': patch
---

Updated and renamed `adminMetaSchemaExtension` to no longer perform the schema merge operation. It now simply returns `{ typeDefs, resolvers }` and allows the calling function to merge them as required, and is renamed to `getAdminMetaSchema`.
