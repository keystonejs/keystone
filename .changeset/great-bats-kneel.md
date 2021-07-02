---
'@keystone-next/fields-document': patch
'@keystone-next/api-tests-legacy': patch
---

Fixed the behaviour of `document(hydrateRelationships: true)` when a related item no longer exists or read access is denied.
The resolver will now set the relationship data to be `{ id }`, leaving the `label` and `data` properties undefined.
