---
'@keystone-6/core': minor
'@keystone-6/cloudinary': patch
'@keystone-6/fields-document': patch
---

Optimises database queries to fetch only required columns. Adds `selectItem`, `g.itemField` and `g.fieldTypeOutput` to declare field selections, and `db.requireItemSelection` to enforce them.
