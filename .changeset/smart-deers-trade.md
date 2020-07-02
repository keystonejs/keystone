---
'@keystonejs/keystone': major
'@keystone-next/keystone': patch
'@keystone-next/types': patch
'@keystonejs/demo-project-meetup': patch
'@keystonejs/cypress-project-access-control': patch
'@keystonejs/cypress-project-basic': patch
'@keystonejs/cypress-project-client-validation': patch
'@keystonejs/cypress-project-login': patch
'@keystonejs/cypress-project-social-login': patch
---

Removed support for multiple database adapters in a single `Keystone` system. The `adapters` and `defaultAdapter` config options were removed from the `Keystone()` constructor.
