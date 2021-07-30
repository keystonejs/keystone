---
'@keystone-next/fields': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---

`disconnectAll` has been replaced by `set` in to-many relationship inputs, the equivalent to `disconnectAll: true` is now `set: []`. There are also seperate input types for create and update where the input for create doesn't have `disconnect` or `set` and also the items. The inputs in the lists in the input field are now also non-null.

If you have a list called `Item`, the to-many relationship inputs now look like this:

```graphql
input ItemRelateToManyForCreateInput {
  create: [ItemCreateInput!]
  connect: [ItemWhereUniqueInput!]
}
input ItemRelateToManyForUpdateInput {
  disconnect: [ItemWhereUniqueInput!]
  set: [ItemWhereUniqueInput!]
  create: [ItemCreateInput!]
  connect: [ItemWhereUniqueInput!]
}
```
