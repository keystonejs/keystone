---
'@keystone-6/core': major
---

Changes the return type for `resolveInput` hook for `json` fields.  Previously you used `'DbNull'` or `'JsonNull'` for respective null magic values - you can now use a Javascript `null` value which is mapped by Keystone to a `Prisma.DbNull`.
