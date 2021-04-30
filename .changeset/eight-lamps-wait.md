---
'@keystone-next/fields': major
---

Replaced `mode` field on `ImageFieldOutput` GraphQL type with making `ImageFieldOutput` an interface and having a `LocalImageFieldOutput` type that implements `ImageFieldOutput`.
