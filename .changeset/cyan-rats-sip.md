---
"@keystone-next/keystone": patch
"@keystone-next/types": patch
---

Added an optional `/_healthcheck` endpoint to Keystone's express server.

You can enable it by setting `config.server.healthCheck: true`

By default it will respond with `{ status: 'pass', timestamp: Date.now() }`

You can also specify a custom path and JSON data:

```js
config({
  server: {
    healthCheck: {
      path: '/my-health-check',
      data: { status: 'healthy' },
    }
  }
})
```

Or use a function for the `data` config to return real-time information:

```js
config({
  server: {
    healthCheck: {
      path: '/my-health-check',
      data: () => ({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime(),
      }),
    }
  }
})
```
