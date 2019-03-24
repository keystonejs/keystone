---
section: packages
title: Core
---

# Core

```DOCS_TODO
TODO
```

<!-- prettier-ignore -->
```javascript
const keystoneServer = require('@keystone-alpha/core');

keystoneServer.prepare({ port: 3000 })
  .then(({ server, keystone }) => {
    server.app.get('/', (req, res) => {
      res.end('Hello world');
    });
    return server.start();
  })
  .catch(error => {
    console.error(error);
  });
```
