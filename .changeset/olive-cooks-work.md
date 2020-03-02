---
'@keystonejs/app-admin-ui': patch
'@keystonejs/fields': patch
---

Detached `CreateItemModal` state from `useList`, this prevents multiple CreateItemModal being shown in case of extending the UI.
