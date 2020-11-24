---
'@keystone-next/auth': patch
---

Updated `getMagicAuthLinkSchema` code to use items API rather than adapter. Fixed hard-coding of `listKey: 'User'` when redeeming tokens.
