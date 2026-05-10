---
"@keystone-6/core": patch
---

Fixed an issue where database errors (connection timeouts, malformed queries, etc.) were swallowed in unique item exists checks at the access control layer.
