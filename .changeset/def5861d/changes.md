- Removed `createSessionMiddleware` export. Most functionality has been replaced by the new `authenticate<List>With<Strategy>` & `unauthenticate<List>` mutations (see `@keystone-alpha/keystone` `CHANGELOG.md` for more details), and remaining functionality that was specific to `@keystone-alpha/app-admin-ui` and has been moved there.
- Auth tokens received by header `Authorization: Bearer <token>` must now
  include the signature (removing a potential attack vector where a client could
  guess with an unsigned token until it matched a logged in user). The `token`
  returned by `authenticate<List>With<Strategy>` includes this signature
  automatically for you.
- `startAuthedSession` now requires a fourth paramter: `cookieSecret` for
  generating the signed `token`.
