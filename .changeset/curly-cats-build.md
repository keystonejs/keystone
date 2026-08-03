---
'@keystone-6/core': patch
---

Adds support for Keystone projects using `"type": "module"` in their `package.json` by generating an empty `package.json` in `.keystone` so Node continues inferring module types in `.keystone`
