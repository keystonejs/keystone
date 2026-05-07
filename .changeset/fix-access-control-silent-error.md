---
"@keystone-6/core": patch
---

Fixed an issue where database errors (connection timeouts, malformed queries, etc.) were silently swallowed during unique item exists checks in the access control layer. These errors are now correctly rethrown to aid in debugging, while still preserving the "item may not exist" message for access denied cases.
