---
'@keystonejs/api-tests': patch
'@keystonejs/fields': patch
---

Fixed a bug when the `ref` list of a `Relationship` field had access control of `{ create: false }`. Keystone no longer throws an error on startup. Fixes #1677.
