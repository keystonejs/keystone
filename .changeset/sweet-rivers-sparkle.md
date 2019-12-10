---
'@keystonejs/app-admin-ui': minor
---

Refactored out session provider from Admin UI and switched to individual Apollo packages as appropriate. Without the session provider, the Admin UI no longer needs the full react-apollo package.
