---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

Changed `config.session` to access a `SessionStrategy` object, rather than a `() => SessionStrategy` function. You will only need to change your configuration if you're using a customised session strategy.
