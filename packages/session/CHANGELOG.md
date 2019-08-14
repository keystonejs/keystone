# @keystone-alpha/session

## 2.0.1

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

## 2.0.0

### Major Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):

  - Removed `createSessionMiddleware` export. Most functionality has been replaced by the new `authenticate<List>With<Strategy>` & `unauthenticate<List>` mutations (see `@keystone-alpha/keystone` `CHANGELOG.md` for more details), and remaining functionality that was specific to `@keystone-alpha/app-admin-ui` and has been moved there.
  - Auth tokens received by header `Authorization: Bearer <token>` must now
    include the signature (removing a potential attack vector where a client could
    guess with an unsigned token until it matched a logged in user). The `token`
    returned by `authenticate<List>With<Strategy>` includes this signature
    automatically for you.
  - `startAuthedSession` now requires a fourth paramter: `cookieSecret` for
    generating the signed `token`.

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 1.0.2

- [patch][bf364bf0](https://github.com/keystonejs/keystone-5/commit/bf364bf0):

  - Restructure internal code

## 1.0.1

- [patch][62e2d517](https://github.com/keystonejs/keystone-5/commit/62e2d517):

  - Fix bug in session audiences

## 1.0.0

- [minor][d718c016](https://github.com/keystonejs/keystone-5/commit/d718c016):

  - `startAuthedSession` now takes an `audiences` paramter, which is attached to the session. `createSessionMiddleware` takes an `audiences` parameter, which is passed through to `startAudthedSession` at `signin`. Added `restrictAudienceMiddleware`, which allows access to an endpoint to be restricted based on which audiences are currently attached to the session.

- [major][5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):

  - Create a new package for all session-handling functionality
