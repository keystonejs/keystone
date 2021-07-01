---
'@keystone-next/fields-document': major
'@keystone-next/examples-app-basic': patch
'keystone-next-app': patch
'@keystone-next/example-document-field': patch
---

Changed the default of `hydrateRelationships` from `false` to `true` to make the common case of rendering inline relationships easier. This is only a breaking change if you explicily want the `hydrateRelationships: false` behaviour.
