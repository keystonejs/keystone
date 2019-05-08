Remove custom server execution from the CLI.

The Keystone CLI does not execute custom servers anymore, instead of running `keystone` to start a Keystone instance that has a custom server, run the server file directly with `node`.

```diff
- "start": "keystone",
+ "start": "node server.js"
```