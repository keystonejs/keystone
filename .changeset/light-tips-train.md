---
'@keystonejs/keystone': patch
---

Fixed several access control input issues:
- `itemIds` is now properly set in list-level updateMany mutation checks. Previously this data was incorrectly assigned to `itemId` which is now `undefined` in list-level checks.
- `itemIds` is now set in field-level updateMany mutation checks (previously `undefined`).
- `itemId` is now set in field-level updateMany mutation checks (previously `undefined`). This is the ID of the item currently being checked.
- `itemId` is now properly set in field-level updateSingle mutation checks (previously `undefined`). 
- All field-level access control checks now have `gqlName` properly set (previously `undefined`). 
