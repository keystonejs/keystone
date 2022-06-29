---
'@keystone-6/core': minor
---

Adds the ability to set ambiguous plurals - like `Firmware` or `Shrimp` - as list names without receiving an error. This builds on the existing `graphql.plural` configuration by adding the configuration options of `ui.label`, `ui.singular`, `ui.plural` and `ui.path` to change the auto-generated names of lists used in the Admin UI
