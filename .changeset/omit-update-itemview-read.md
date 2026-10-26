---
"@keystone-6/core": patch
---

When `graphql.omit.update` is set, coerce a static `ui.itemView.fieldMode: 'edit'` to `'read'`. Dynamic field modes that switch between `read` and `hidden` are left unchanged.
