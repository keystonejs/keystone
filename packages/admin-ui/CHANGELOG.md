# @voussoir/admin-ui

## 1.0.1

- [patch] 23c3fee5:

  - Update babel packages and plugins

- [patch] ca1f0ad3:

  - Update to latest webpack packages

- [patch] 6fedba68:

  - DX: Show incoming queries in console and GraphiQL

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] 1855d1ba:

  - Update dependencies with 'yarn audit' identified issues

- [patch] eaab547c:

  - Allow adding related items from the Relationship field

- [patch] d0fbd66f:

  - Update apollo dependencies on both client and server

- Updated dependencies [e16315d5]:
  - @arch-ui/pill@0.1.0

## 1.0.0

- [minor] 306f0b7e:

  - Remove recalcHeight prop from Filter props

- [major] 5f8043b5:

  - Simplify Field component api
    - Replace item prop with value prop which is equal to item[field.path]
    - Replace itemErrors prop with error prop which is equal to itemErrors[field.path]
    - Change onChange prop so that it only accepts the value rather than the field and the value
    - Remove initialData prop which wasn't used in a Field component and was only pass to the Field components in one the places where the Field component is used

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [53e27d75]:
- Updated dependencies [a3d5454d]:
  - @voussoir/fields@3.0.0
  - @voussoir/utils@1.0.0

## 0.8.0

- [patch] 18ce8bc4:

  - Add warning when leaving item page with unsaved changes

- [patch] 8d8666ad:

  - Dependency upgrade: graphql -> 14.0.3, graphql-tools -> 4.0.3

- [minor] 6d8ce0fc:

  - Add createMany and updateMany mutations

## 0.7.0

- [patch] 32960e4d:

  - Improve accessibility

- [minor] 8145619f:

  - update to selecting and managing items in the list view

- [patch] e3b48810:

  - Use babel 7

- [patch] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- [patch] 8fc0abb3:

  - Make DayPicker scrollable

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [c83c9ed5]:
- Updated dependencies [01718870]:
  - @voussoir/fields@2.0.0

## 0.6.0

- [minor] 7a24b92e:

  - sticky table headers in list view for supporting browsers

- [minor] 589dbc02:

  - navigation improvements and paper cut fixes

## 0.5.0

- [minor] 1d30a329"
  :

  - Cleanup vertical navigation, more separation between primary/secondary nav primitives

## 0.4.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.3.0

- [minor] 5742e25d"
  :

  - Various improvements

## 0.2.1

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [patch] Updated dependencies [445b699](445b699)
- [patch] Updated dependencies [9c75136](9c75136)
- [patch] Updated dependencies [750a83e](750a83e)
  - @voussoir/fields@1.0.0
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
