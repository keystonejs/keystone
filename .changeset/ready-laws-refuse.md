---
"@keystone-6/core": major
---

`displayMode: 'count'` on relationship fields now requires `itemView.fieldMode: 'read'` or a dynamic `fieldMode` that only resolves to `'read'` or `'hidden'`.
