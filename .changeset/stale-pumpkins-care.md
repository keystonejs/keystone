---
'@keystone-next/keystone': major
'@keystone-next/auth': major
'@keystone-next/fields-document': major
'@keystone-next/cloudinary': major
---

- The following types have been renamed:
  - `BaseGeneratedListTypes` → `BaseListTypeInfo`
  - `ItemRootValue` → `BaseItem`
  - `ListInfo` → `ListGraphQLTypes`
  - `TypesForList` → `GraphQLTypesForList`
- `FieldTypeFunc` now has a required type parameter which must satisfy `BaseListTypeInfo`
- The following types now have a required type parameter which must satisfy `BaseKeystoneTypeInfo`:
  - `ServerConfig`
  - `CreateRequestContext`
  - `AdminUIConfig`
  - `DatabaseConfig`
  - `ListOperationAccessControl`
  - `MaybeSessionFunction`
  - `MaybeItemFunction`
- `GraphQLResolver` and `GraphQLSchemaExtension` now have a required type parameter which must satisfy `KeystoneContext`
- `KeystoneGraphQLAPI` no longer has a type parameter
- The first parameter to the resolver in a `virtual` field will be typed as the item type if the list is typed with `Keystone.Lists` or `Keystone.Lists.ListKey`, otherwise it will be typed as `unknown`
- The `item`/`originalItem` arguments in hooks/access control will now receive the `Item` type if the list is typed with `Keystone.Lists` or `Keystone.Lists.ListKey`, otherwise it will be typed as `BaseItem`
- `args` has been removed from `BaseListTypeInfo`
- `inputs.orderBy` and `all` has been added to `BaseListTypeInfo`
- In `.keystone/types`:
  - `ListKeyListTypeInfo` has been moved to `Lists.ListKey.TypeInfo`
  - `KeystoneContext` has been renamed to `Context`
