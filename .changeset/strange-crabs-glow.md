---
'@keystone-next/keystone': major
'@keystone-next/types': major
'@keystone-next/fields-document': patch
'@keystone-next/fields': patch
---

The generated CRUD queries, and some of the input types, in the GraphQL API have been renamed.

If you have a list called `Item`, the query for multiple values, `allItems` will be renamed to `items`. The query for a single value, `Item`, will be renamed to `item`.

Also, the input type used in the `updateItems` mutation has been renamed from `ItemsUpdateInput` to `ItemUpdateArgs`.
