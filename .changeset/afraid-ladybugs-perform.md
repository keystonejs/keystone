---
'@keystone-next/keystone': minor
---

Added the experimental config option `config.experimental.contextInitialisedLists`, which adds the internal data structure `experimental.initialisedLists` to the `context` object. This is a temporary addition to the API which will be removed in a future release once a more controlled API is available. It should be used with caution, as it will contain breaking change in `patch` level releases.
