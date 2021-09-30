---
'@keystone-next/keystone': major
---

* Consolidated the `beforeChange`/`beforeDelete` and `afterChange`/`afterDelete` hooks into `beforeOperation` and `afterOperation`.
* Renamed the `existingItem` argument for all hooks (except `afterOperation`) to `item`.
* Renamed the `existingItem` argument for `afterOperation` to `originalItem`.
* Renamed the `updatedItem` argument for `afterOperation` to `item`.

See the [Hooks API docs](https://keystonejs.com/docs/apis/hooks) for a complete reference for the updated API.
