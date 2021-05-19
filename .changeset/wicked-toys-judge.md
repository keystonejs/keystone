---
'@keystone-next/admin-ui': major
'@keystone-next/auth': major
'@keystone-next/cloudinary': major
'@keystone-next/fields': major
'@keystone-next/fields-document': major
'@keystone-next/keystone': major
---

Consolidated the `@keystone-next/admin-ui` package into `@keystone-next/keystone`.

If you were directly importing from `@keystone-next/admin-ui` you can now import the same items from `@keystone-next/keystone/admin-ui`.
If you have `@keystone-next/admin-ui` in your `package.json` you should remove it.
