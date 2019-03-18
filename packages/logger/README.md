---
section: packages
title: Logger
---

# Logger

## API

### `require('@keystone-alpha/logger')(name)`

Provides an instance of [`pino`](https://github.com/pinojs/pino) based on the
given `name`.
Instances are cached and re-used, making it safe to request the same named
instance across multiple files.

### `process.env.DISABLE_LOGGING`

When set to any truthy value, will prevent any log output from occuring
(particularly useful during test runs).
