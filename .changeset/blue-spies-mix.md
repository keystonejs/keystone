---
'@keystone-next/keystone': major
---

`context.createContext()` now inherits the argument values for `sessionContext` and `skipAccessControl` from `context` as defaults.

This means, for example, that

```js
context.createContext({ skipAccessControl: true })
```

will create a new context with the same `sessionContext` that the original `context` object had.
