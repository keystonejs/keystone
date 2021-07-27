---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

The delete mutations now accept where unique inputs instead of only an id.

If you have a list called `Item`, `deleteItem` now looks like `deleteItem(where: ItemWhereUniqueInput!): Item` and `deleteItems` now looks like `deleteItems(where: [ItemWhereUniqueInput!]!): [Item]`
