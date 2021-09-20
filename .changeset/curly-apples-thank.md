---
'@keystone-next/keystone': major
---

Removed `isRequired` and the `defaultValue` can no longer by dynamic in the `json` field. If you were using `isRequired`, the same behaviour can be re-created with the `validateInput` hook.
