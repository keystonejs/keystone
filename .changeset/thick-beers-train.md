---
'@keystone-next/keystone': major
---

The items API (`context.lists.Post.findOne()`, etc) now use the `context` object they are bound to, rather than creating a new context object with `{ skipAccessControl: true }` when executing the operation.

If you were relying on this behaviour you should change your code from:

```js
context.lists.Post.findOne(...)
```

to

```js
context.createContext({ skipAccessControl: true }).lists.Post.findOne(...)
```
