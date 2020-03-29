---
'@keystonejs/keystone': minor
'@keystonejs/session': minor
---

  Session cookie option `cookieSameSite` added. `cookieSameSite` defaults to `false` and will not set the `SameSite` attribute.

  ```javascript
  const keystone = new Keystone({
    cookieSameSite: true,
  });
  ```
