---
'@keystonejs/api-tests': minor
'@keystonejs/keystone': minor
---

Added `fields` list to ListSchema. This optionally takes a `where: { type }` argument and returns metadata for all matching fields on list, including name, type, and user-provided config.
