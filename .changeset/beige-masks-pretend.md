---
'@keystone-next/fields': patch
'@keystone-next/adapter-prisma-legacy': patch
---

Fixed a bug which added unsupported string filter options to the GraphQL API for the SQLite provider.
Added a `.containsInputFields()` method to include string filters just for the `contains` and `not_contains` options.
