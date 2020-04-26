---
'@keystonejs/app-admin-ui': minor
'@keystonejs/list-plugins': major
---

* Added `singleton` list plugin which prevents creating more items for a list or delete the only item in the list.

* Updated `admin-ui` to 
  - Redirect to the only item if there is an item in singleton list
  - Hide `Search` field, `Back` and `AddNew` buttons on item details page
