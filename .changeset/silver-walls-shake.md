---
'@keystonejs/access-control': minor
'@keystonejs/app-graphql': minor
'@keystonejs/app-admin-ui': minor
'@keystonejs/keystone': minor
---

Added a new private internal schema that will allow a better method of bypassing access control on the `executeGraphQL` function. 

The schema name `internal` is now a reserved name and if you have a schema with this name you will need to change it with this update.

Note: You cannot change access control on the `internal` schema.
