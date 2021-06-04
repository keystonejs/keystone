---
'@keystone-next/auth': major
'@keystone-next/cloudinary': major
'@keystone-next/fields': major
'@keystone-next/fields-document': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---

The core of Keystone has been re-implemented to make implementing fields and new features in Keystone easier. While the observable changes for most users should be minimal, there could be breakage. If you implemented a custom field type, you will need to change it to the new API, see fields in the `@keystone-next/fields` package for inspiration on how to do this.
