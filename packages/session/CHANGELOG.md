# @keystone-alpha/session

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
