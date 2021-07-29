---
'@keystone-next/fields': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---

`disconnectAll` has been renamed to `disconnect` in to-one relationship inputs and the old `disconnect` field has been removed. There are also seperate input types for create and update where the input for create doesn't have `disconnect`. It's also now required that if you provide a to-one relationship input, you must provide exactly one field to the input.

If you have a list called `Item`, the to-one relationship inputs now look like this:

```graphql
input ItemRelateToOneForCreateInput {
  create: ItemCreateInput
  connect: ItemWhereUniqueInput
}
input ItemRelateToOneForUpdateInput {
  create: ItemCreateInput
  connect: ItemWhereUniqueInput
  disconnect: Boolean
}
```
