---
'@keystone-6/core': major
---

Changes the return type for the `resolveInput` hook with `json` fields.  Previously you may have used `'DbNull'` or `'JsonNull'` as respective null magic values - you can now always use a Javascript `null` value.
Unlike previous behaviour, a null value will now consistently map to a `Prisma.DbNull`.
