---
'@keystonejs/keystone': patch
---
Made sure `createRelationships` function in `relationship-utils.js` uses the correct relatedListKey by splitting out possible field name;

This fixes an issue where createItems throws an Error when using Lists Back References.
Fixes #2360
