---
'@keystonejs/app-admin-ui': patch
---

Removed `errorPolicy: 'all'` from `useMutation` to allow `onError` callback to be triggered. Thanks `@miguelvvs`.
