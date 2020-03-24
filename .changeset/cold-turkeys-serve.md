---
'@keystonejs/demo-project-blog': patch
'@keystonejs/keystone': patch
---

Keystone providers can now be instantiated lazily.
This enables calling `keystone.createAuthStrategy()` at any time before or after
associated Lists are created.
