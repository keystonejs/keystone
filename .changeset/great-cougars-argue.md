---
'@keystone-next/website': patch
'@keystone-next/example-playground': patch
'@keystone-next/keystone': patch
---

Adds support for `introspection` in the Apollo Server config. Introspection enables you to query a GraphQL server for information about the underlying schema. If the playground is enabled then introspection is automatically enabled - unless specifically disabled.
