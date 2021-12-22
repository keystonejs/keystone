---
'@keystone-6/core': patch
---

Differentiate types for the field `resolveInput` hook and the list `resolveInput` hook.
`undefined` may  be returned by field `resolveInput` hooks (indicates a no-op), but not for lists.
