---
'@keystone-6/auth': major
---

`createAuth` now requires `sessionStrategy` and `getAuthenticatedItemId` options. `createAuth` no longer loads the authenticated item into the session, so the `sessionData` option has been removed and sessions are no longer shaped as `{ itemId, data }`. Provide `getSession` in your Keystone config and return whatever session your application needs.
