---
'@keystonejs/app-admin-ui': patch
---

Always compile client directory regardless of whether or not the package is a direct child of a `node_modules` directory to work correctly with pnpm.
