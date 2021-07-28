---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

The create one mutation now requires a non-null `data` argument and the create many mutation accepts a list of `ItemCreateInput` directly instead of being nested inside of an object with the `ItemCreateInput` in a `data` field.

If you have a list called `Item`, `createItem` now looks like `createItem(data: ItemCreateInput!): Item` and `createItems` now looks like `createItems(where: [ItemCreateInput!]!): [Item]`.
