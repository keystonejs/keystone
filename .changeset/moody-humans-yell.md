---
'@keystone-alpha/adapter-knex': major
'@keystone-alpha/adapter-mongoose': major
'@keystone-alpha/fields': major
'@keystone-alpha/keystone': major
'@keystone-alpha/mongo-join-builder': major
---

This change significantly changes how and when we populate `many`-relationships during queries and mutations.
The behaviour of the GraphQL API has not changed, but queries should be more performant, particularly for items with many related items.
The `existingItem` parameter in hooks will no longer have the `many`-relationship fields populated.
`List.listQuery()` no longer populates `many` relationship fields.
For most users there should not need to be any changes to code unless they are explicitly relying on a `many`-relationship field in a hook, in which case they will need to execute an explicit query to obtain the desired values.
