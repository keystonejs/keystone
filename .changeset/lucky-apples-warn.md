---
'@keystonejs/keystone': patch
---

Removing unnecessary calls to field type postRead hooks on delete operations. The internal _delete() functions provide by the DB adapter now return a count of the records removed.
