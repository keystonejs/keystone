---
'@keystone-next/keystone': major
---

Removed `isRequired` and `defaultValue` from the `image` and `file` fields. If you were using these options, the same behaviour can be re-created with the `validateInput` and `resolveInput` hooks respectively.
