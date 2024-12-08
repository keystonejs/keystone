---
"@keystone-6/core": minor
---

Renamed `__ResolvedKeystoneConfig` to `ResolvedKeystoneConfig`.
Changed `config` function to return config with defaults instead of just type casting. This now returns `ResolvedKeystoneConfig` instead of `KeystoneConfig`
