---
"@keystone-6/fields-document": patch
---

Fixes URL validation bug by using `encodeURI` to preserve percent-encoded characters during validation.
