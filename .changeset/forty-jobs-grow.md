---
'@keystone-next/cloudinary': major
---

Removed `isRequired` and `defaultValue` from `cloudinaryImage` field. If you were using these options, the same behaviour can be re-created with the `validateInput` and `resolveInput` hooks respectively.
