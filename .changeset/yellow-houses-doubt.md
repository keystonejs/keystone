---
'@keystone-6/fields-document': patch
---

Fixes the document editor from breaking when the underlying schema for a component has a new field added.
Please note that new fields will still be missing for existing data when fetched from GraphQL
