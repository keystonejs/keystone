---
'@keystonejs/keystone': minor
---

Added additional parameters to list plugins which expose `{ listKey, keystone }` to plugins. This helps plugin know name of list and keystone instance. Existing plugins are not affected by this change.

New plugin signature: `(config, { listKey, keystone }) => config`