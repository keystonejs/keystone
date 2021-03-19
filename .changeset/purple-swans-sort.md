---
'@keystone-next/keystone': major
'@keystone-next/types': minor
---

Added `db.useMigrations` option to replace using `keystone-next dev` and `keystone-next prototype` depending on what kind of migration strategy you wanted to use. If you were previously using `keystone-next dev`, you should set `db.useMigrations` to true in your config and continue using `keystone-next dev`. If you were previously using `keystone-next prototype`, you should now use `keystone-next dev`.
