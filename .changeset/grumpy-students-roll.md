---
'@keystonejs/api-tests': minor
'@keystonejs/utils': minor
'@keystonejs/fields-mongoid': patch
'@keystonejs/fields': patch
'@keystonejs/test-utils': patch
---

Introduce a framework for testing CRUD operations on fields. This surfaced a bug in the Decimal field where updating _other_ fields would result in a Decimal field being reset to null.
