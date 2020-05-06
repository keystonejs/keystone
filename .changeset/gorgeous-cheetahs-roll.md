---
'@keystonejs/app-admin-ui': major
'@keystonejs/field-views-loader': major
---

The default function in `@keystonejs/field-views-loader` now takes `{ pages, hooks, listViews }` rather than `{ adminMeta }`.
`AdminUIApp` now has a method `.getAdminViews({ keystone, includeLists })` which returns these values.
`AdminUIApp.createDevMiddleware` now takes `{ adminMeta, keystone }` as arguments.
These changes will only effect users who may have explicitly been using the `@keystone/fields-views-loader` packages or `.createDevMiddleware()`.
