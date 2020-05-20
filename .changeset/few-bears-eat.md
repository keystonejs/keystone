---
'@keystonejs/app-admin-ui': major
'@keystonejs/field-content': major
'@keystonejs/fields': major
'@keystonejs/fields-mongoid': major
---

Refactored how list and item queries and generated. Field controllers' `getFilterGraphQL` method now returns an object in the format { filter: value } rather than a GraphQL string.