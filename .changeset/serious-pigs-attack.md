---
'@keystone-next/fields': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---


Added `ui.searchFields` option to lists to allow searching by multiple fields in the Admin UI(the only current usage of this is in the select used in relationship fields) and to replace the usage of the `search` GraphQL argument which will be removed soon and should be replaced by using contains filters directly.
