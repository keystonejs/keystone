---
'@keystonejs/keystone': minor
'@keystonejs/list-plugins': minor
---

Added `singleton` list plugin which prevents creating more items for a list or delete the only item in the list.
Added keystone and list key to the list config to make them accessible to plugin. Plugin now has access to `keystone` to make use of `executeQuery` or specific information about the list at run time.
