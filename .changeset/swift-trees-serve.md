---
'@keystonejs/fields': patch
'@keystonejs/keystone': patch
---

* Modified Field and adminMeta to make custom field config and custom list adminConfig values available to `admin-ui`.
* Added `publicConfig` option in Keystone constructor which is also made available to `admin-ui` through `adminMeta`
