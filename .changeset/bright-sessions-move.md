---
'@keystone-6/core': major
'@keystone-6/auth': major
---

Replaces the `session` Keystone config option with `getSession`. `context.sessionStrategy` has been removed, and the `SessionStrategy` type is no longer exported from `@keystone-6/core/types`.
