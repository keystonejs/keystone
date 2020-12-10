---
'@keystone-next/fields': major
'@keystonejs/fields': major
---

Replaced `useCompiledBcrypt` option with `bcrypt` option which accepts an alternative implementation of bcrypt(such as the native `bcrypt` npm package) in the password field type.

For example, if you had the following field definition:

```js
password: { type: Password, useCompiledBcrypt: true }
```

you will need to change it to:

```js
password: { type: Password, bcrypt: require('bcrypt') }
```