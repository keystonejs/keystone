---
'@keystonejs/keystone': minor
'@keystonejs/session': minor
---

Cookie configuration moved to an object to allow us to pass it directly to the express-session middleware. We where prviously only able to set `secure` and `maxAge`, bat are now also able to set `domain`, `expires`, `httpOnly`, `path` and `sameSite`

  #### Default

  ```javascript
  const keystone = new Keystone({
    cookie: {
      // domain: undefined,
      // expires: undefined,
      // httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: false,
      // path: '/',
      secure: process.env.NODE_ENV === 'production', // Defaults to true in production
    },
  });
  ```
