---
'@keystone-6/core': major
---

Replaces `@keystone-6/core/testing`'s `resetDatabase` function with new implementations in `@keystone-6/core/testing/postgresql`, `@keystone-6/core/testing/sqlite` and `@keystone-6/core/testing/mysql`. Instead of using `prisma db push`, it accepts a path to your migrations directory and runs the migrations.
