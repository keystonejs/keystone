---
'@keystone-next/auth': major
'@keystone-next/fields': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---

The update mutations now accept `where` unique inputs instead of only an `id` and the `where` and `data` arguments are non-null.

If you have a list called `Item`, the update mutations now look like this:

```graphql
type Mutation {
    updateItem(where: ItemWhereUniqueInput!, data: ItemUpdateInput!): Item
    updateItems(data: [ItemUpdateArgs!]!): [Item]
}

input ItemUpdateArgs {
    where: ItemWhereUniqueInput!
    data: ItemUpdateInput!
}
```
