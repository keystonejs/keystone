---
'@keystonejs/keystone': minor
---

Added an `appVersion` parameter to the `Keystone()` constructor. This version will be set as the `X-Keystone-App-Version` HTTP header on all requests. It can be queried via the GraphQL API as `{ appVersion }`. See the docs for more configuration details.
