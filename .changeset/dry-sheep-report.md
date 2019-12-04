---
'@keystonejs/keystone': minor
'@keystonejs/api-tests': patch
---

Added [authentication hooks](https://www.keystonejs.com/api/hooks).

You can now customise the behaviour of authentication mutations as follows:

```js
keystone.creatAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  hooks: {
    resolveAuthInput: async (...) => {...},
    validateAuthInput: async (...) => {...},
    beforeAuth: async (...) => {...},
    afterAuth: async (...) => {...},

    beforeUnauth: async (...) => {...},
    afterUnauth: async (...) => {...},
  },
})
```
