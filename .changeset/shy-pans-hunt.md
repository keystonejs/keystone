---
'@keystone-next/auth': patch
'@keystone-next/cloudinary': patch
'@keystone-next/fields-document': patch
'@keystone-next/keystone': patch
---

Changed the way the package directory for resolving views is obtained to use `__dirname` rather than `require.resolve('pkg/package.json')` because in Next.js 11 `require.resolve` returns a numeric id instead of the path.
