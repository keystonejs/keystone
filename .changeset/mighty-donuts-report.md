---
'@keystone-next/keystone': major
---

Updated `@graphql-ts/schema` to `0.5.0`. The `__rootVal` properties on `ObjectType`, `InterfaceType` and `UnionType` have been renamed to `__source`, this is intended to be internal but it could be depended on so if you did, you will need to change to `__source`. The `fields` property on `InterfaceType` has been renamed to `__fields` and it will no longer exist at runtime like the other types.
