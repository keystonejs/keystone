---
'@keystone-6/document-renderer': major
'@keystone-6/fields-document': major
'@keystone-6/cloudinary': major
'create-keystone-app': major
'@keystone-6/auth': major
'@keystone-6/core': major
---

Changes package to exclusively Node ESM. This is intended to be used by `require(esm)` and should not affect consumers beyond requiring a modern Node version. `keystone build` outputs are still CommonJS.
