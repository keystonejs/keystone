---
"@keystone-6/core": patch
---

Fixed an issue where database errors (connection issues, timeouts, etc.) occurring during unique item existence checks (e.g. in relationship resolvers) were silently swallowed and replaced with a generic "Access denied" error. Unexpected errors are now correctly rethrown to aid debugging.
