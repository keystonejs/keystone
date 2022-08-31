---
'@keystone-6/core': patch
---

Fixes nullable and non-nullable calendarDay fields existing in the same schema creating a GraphQL schema with two different types with the same name
