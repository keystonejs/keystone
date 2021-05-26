---
'@keystone-next/keystone': major
'@keystone-next/website': patch
'@keystone-next/example-auth': patch
'@keystone-next/app-basic': patch
'@keystone-next/example-blog': patch
'@keystone-next/example-ecommerce': patch
'@keystone-next/example-embedded-nextjs': patch
'keystone-next-app': patch
'@keystone-next/example-roles': patch
'@keystone-next/example-sandbox': patch
'@keystone-next/example-todo': patch
'@keystone-next/example-with-auth': patch
'@keystone-next/api-tests-legacy': patch
---

Changed the return type of `allItems(...)` from `[User]` to `[User!]`, as this API can never have `null` items in the return array.
