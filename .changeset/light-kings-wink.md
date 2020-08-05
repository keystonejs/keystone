---
'@keystonejs/app-admin-ui': patch
---

Force all imports of `@apollo/client` in the Admin UI to use the copy of `@apollo/client` that is a dependency of `@keystonejs/app-admin-ui`. This resolves issues if `@apollo/client` resolves to a different copy of `@apollo/client` in a field view.
