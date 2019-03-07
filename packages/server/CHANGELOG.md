# @keystone-alpha/server

# @voussoir/server

## 1.1.0

- [minor] 6fedba68:

  - DX: Show incoming queries in console and GraphiQL

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] d0fbd66f:

  - Update apollo dependencies on both client and server

## 1.0.0

- [major] 723371a0:

  - Correctly surface nested errors from GraphQL

- [minor] ced0edb3:

  - Allow passing of Apollo Server config via webserver

- Updated dependencies [aca26f71]:
- Updated dependencies [a3d5454d]:
  - @voussoir/utils@1.0.0

## 0.5.1

- [patch] 4d198f04:

  - Update dependencies: apollo-server-express -> 2.3.1

- [patch] 8d8666ad:

  - Dependency upgrade: graphql -> 14.0.3, graphql-tools -> 4.0.3

## 0.5.0

- [minor] c83c9ed5:

  - Add Keystone.getAccessContext and remove List.getAccessControl, List.getFieldAccessControl, and Field.validateAccessControl.

- [patch] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

## 0.4.0

- [minor] ae3b8fda:

  - Makes CORS user configurable

## 0.3.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.2.1

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
