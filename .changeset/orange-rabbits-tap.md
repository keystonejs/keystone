---
'@keystonejs/auth-password': major
---

Changed the default value of [`protectIdentities`](https://www.keystonejs.com/keystonejs/auth-password/#config) from `false` to `true`.
To keep the current behaviour you can explicitly pass through the value you want, e.g.

```
keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: { protectIdentities: true },
});
```
