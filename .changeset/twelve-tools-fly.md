---
'@keystone-next/admin-ui-utils': major
---

Changed `onChange` prop on `Fields` component to accept a function that accepts the value and returns a new value rather than just accepting the value so that the fields components can be memoized.
