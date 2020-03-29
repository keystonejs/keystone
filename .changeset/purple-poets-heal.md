---
'@keystonejs/keystone': major
'@keystonejs/session': major
---

Moved the cookie configuration from individual options to an object which is passed directly to the express-session middleware.
Previously you could only set `secure` and `maxAge` via `secureCookies` and `cookieMaxAge`.
These options have been removed.
You can now set a config option called `cookie` which can contain `secure` and `maxAge`, as well as `domain`, `expires`, `httpOnly`, `path` and `sameSite`.

The `sameSite` option is now explicitly defaulted to `false`.

See the [express-session middleware docs](https://github.com/expressjs/session#cookie) for more details on these options..

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
