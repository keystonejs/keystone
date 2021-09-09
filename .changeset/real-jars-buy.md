---
'@keystone-next/keystone': major
---

Removed `isRequired` and `defaultValue` from `image` and `file`. If you were using these options, the same behaviour can be re-created with the `validateInput` and `resolveInput` hooks respectively.
