---
'@keystonejs/session': minor
---

Updated `endAuthedSession` to return the `listKey` and `itemId` of the logged out user if there was one. The return object is now `{ success, listKey, itemId }`.
