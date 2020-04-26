---
'@keystonejs/keystone': minor
'@keystonejs/app-admin-ui': minor
'@keystonejs/list-plugins': minor
---

* Added `singleton` list plugin which prevents creating more items for a list or delete the only item in the list.

* Added keystone and list key to the list config to make them accessible to plugin. Plugin now has access to `keystone` to make use of `executeQuery` or specific information about the list at run time.

* Updated `admin-ui` to 
  - Redirect to singleton item if there is an item
  - Hide `Search` field, `Back` and `AddNew` buttons on item details page
  - Disable the `Delete` button on item details page if the access for delete is false.
