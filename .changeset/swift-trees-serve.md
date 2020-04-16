---
'@keystonejs/fields': patch
'@keystonejs/app-admin-ui': patch
---

* Made all values in `adminConfig` list options available to `admin-ui` as part of list's `adminMeta`.
* Added `adminConfig` option to all Fields which are made available to field's `adminMeta` in `admin-ui`.
* Added `adminMeta` option in `AdminUIApp` constructor which is also made available to `adminMeta` of `admin-ui`.

All the improvements are useful in `admin-ui` customizations like UI Hooks or custom Field Views.
