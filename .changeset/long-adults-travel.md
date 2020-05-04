---
'@keystonejs/keystone': major
'@keystonejs/session': major
---

The `cookieSecret` option no longer defaults to a static value. It is now required in production mode. In development mode, if undefined, a random new value is generated each time the server is started.
