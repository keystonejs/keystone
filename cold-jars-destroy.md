---
"@keystone-next/keystone": patch
---

Added `db.foreignKey` option to the `relationship` field that allows you to explicitly pick which side of a one to one relationship the foreign key should be on and for one to one or one to many relationships add `@map` to the foreign key to change the column name in the database.
 
