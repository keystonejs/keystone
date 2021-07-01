---
'@keystone-next/document-renderer': patch
---

Inline relationship data which is null or undefined is now explicitly set to `null`, rather than `{}`.
