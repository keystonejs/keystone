---
'@keystone-next/keystone': major
---

Fixed the behaviour of `createItems`, `updateItems`, and `deleteItems` mutations to be consistent and predictable.

Previously, these mutations could return items in an arbitrary order. They now return items in the same order they were provided to the mutation.

Previously, if there was an error, say a validation error, on one or more of the items then the return value would be `null` and a single top level error would be returned. The state of the database in this case was non-deterministic.

The new behaviour is to return values for all items created, with `null` values for those that had errors. These errors are returned in the `errors` array and have paths which correctly point to the `null` values in the returned array. All the valid operations will be completed, leaving the database in a deterministic state.

Previously, if items were filtered out by declarative access control, then no error would be returned, and only those accessible items would be returned. Now the returned data will contain `null` values for those items which couldn't accessed, and the `errors` array will contain errors with paths which correctly point to the `null` values in the returned array.

Previously, if static access control denied access to the mutation, then `null` was returned, and a single `error` was returned. Now, an array of `null`s is returned, with a separate error for each object. This makes the behaviour of static and declarative access control consistent.
