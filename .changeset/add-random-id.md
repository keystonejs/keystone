---
'@keystone-6/core': minor
---

Adds new random identifier type as `db: { idField: { kind: 'random', bytes?: number, encoding?: 'hex' | 'base64url' } }`, with a default of 32 bytes, encoded as `base64url`
