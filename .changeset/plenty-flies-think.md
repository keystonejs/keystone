---
'@keystone-next/auth': major
'@keystone-next/cloudinary': major
'@keystone-next/fields': major
'@keystone-next/fields-document': major
'@keystone-next/keystone': major
'@keystone-next/types': major
---

The core of Keystone has been re-implemented to make implementing fields and new features in Keystone easier. While we've worked hard to ensure that the changes are minimal, the changes should be minimal, it's likely that there is some change. If you implemented custom field type, you will need to change it to the new API, see fields in the `@keystone-next/fields` package for inspiration on how to do this.
