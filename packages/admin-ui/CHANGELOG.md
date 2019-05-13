# @keystone-alpha/admin-ui

## 3.2.0

### Minor Changes

- [22ec53a8](https://github.com/keystonejs/keystone-5/commit/22ec53a8):

  - Adding support for custom pages in Admin UI

- [6f598e83](https://github.com/keystonejs/keystone-5/commit/6f598e83):

  - Add Admin UI static building

### Patch Changes

- [18b88df0](https://github.com/keystonejs/keystone-5/commit/18b88df0):

  Fix a bug with admin UI serving in production

- [ebb858a5](https://github.com/keystonejs/keystone-5/commit/ebb858a5):

  - Optimistically open Nested Create Item Modal and show loading spinner

- [b8fc0a22](https://github.com/keystonejs/keystone-5/commit/b8fc0a22):

  - Add tooltip to columns button in list table

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

- [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):

  - Field view Controllers: Rename `.getValue()` to `.serialize()` and add `.deserialize()` to enable handling pre-save to server & post-read from server respectively.

- [5e7d1940](https://github.com/keystonejs/keystone-5/commit/5e7d1940):

  - Remove custom context menu on list page

- [c79cd7eb](https://github.com/keystonejs/keystone-5/commit/c79cd7eb):

  - Update Many modal shows spinner while loading fields

- [51a0d853](https://github.com/keystonejs/keystone-5/commit/51a0d853):

  Put the admin UI at `adminPath` rather than `/admin` with prod middleware.

- [c9102446](https://github.com/keystonejs/keystone-5/commit/c9102446):

  - Add a mechanism for loading multiple Suspense-aware components in parallel

- [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):

  - Field view Controllers: Rename `.getIntialData()` to `.getDefaultValue()` to better reflect the purpose of the function.

* [5637518f](https://github.com/keystonejs/keystone-5/commit/5637518f):

  - Show loading spinner while loading views in List Table

* [997c0b9c](https://github.com/keystonejs/keystone-5/commit/997c0b9c):

  - DX: Open Create Modal optimistically and display loading state

- Updated dependencies [e6e95173](https://github.com/keystonejs/keystone-5/commit/e6e95173):
- Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
- Updated dependencies [81b481d0](https://github.com/keystonejs/keystone-5/commit/81b481d0):
- Updated dependencies [a03fd601](https://github.com/keystonejs/keystone-5/commit/a03fd601):
- Updated dependencies [5f1a5cf3](https://github.com/keystonejs/keystone-5/commit/5f1a5cf3):
- Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
- Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
- Updated dependencies [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):
- Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
- Updated dependencies [5f1a5cf3](https://github.com/keystonejs/keystone-5/commit/5f1a5cf3):
  - @keystone-alpha/fields@6.0.0
  - @keystone-alpha/build-field-types@1.0.0
  - @arch-ui/controls@0.0.5
  - @arch-ui/input@0.0.5
  - @arch-ui/confirm@0.0.6
  - @arch-ui/dialog@0.0.6
  - @arch-ui/drawer@0.0.6
  - @arch-ui/dropdown@0.0.6
  - @arch-ui/tooltip@0.0.6
  - @arch-ui/popout@0.0.6
  - @keystone-alpha/utils@3.0.0

## 3.1.0

- [patch][ec76b500](https://github.com/keystonejs/keystone-5/commit/ec76b500):

  - Add missing arch-ui deps to admin-ui

- [patch][2e227a73](https://github.com/keystonejs/keystone-5/commit/2e227a73):

  - Correctly handle async .getValue() calls when saving

- [minor][e75c105c](https://github.com/keystonejs/keystone-5/commit/e75c105c):

  - admin revamp

- Updated dependencies [85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):
  - @keystone-alpha/fields@5.0.0

## 3.0.6

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [patch][7b8d254d](https://github.com/keystonejs/keystone-5/commit/7b8d254d):

  - Update external dependencies

- [patch][24bed583](https://github.com/keystonejs/keystone-5/commit/24bed583):

  - Update react-router-dom dependency to 5.0.0

- [patch][545c9464](https://github.com/keystonejs/keystone-5/commit/545c9464):

  - Add support for mass update

- Updated dependencies [545c9464](https://github.com/keystonejs/keystone-5/commit/545c9464):
- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):
- Updated dependencies [302930a4](https://github.com/keystonejs/keystone-5/commit/302930a4):
  - @keystone-alpha/fields@4.0.0
  - @arch-ui/drawer@0.0.4
  - @arch-ui/confirm@0.0.4
  - @arch-ui/dialog@0.0.4
  - @arch-ui/dropdown@0.0.4
  - @arch-ui/popout@0.0.4
  - @arch-ui/tooltip@0.0.4

## 3.0.5

- Updated dependencies [4131e232](https://github.com/keystonejs/keystone-5/commit/4131e232):
  - @keystone-alpha/field-views-loader@2.0.0

## 3.0.4

- [patch][d718c016](https://github.com/keystonejs/keystone-5/commit/d718c016):

  - Add the `admin` audience when signing in via the admin UI session middleware.

- [patch][5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):

  - Use the new @keystone-alpha/session package

- Updated dependencies [d718c016](https://github.com/keystonejs/keystone-5/commit/d718c016):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
  - @keystone-alpha/session@1.0.0

## 3.0.3

- [patch][85cb44a9](https://github.com/keystonejs/keystone-5/commit/85cb44a9):

  - Introduce `pages` config option
  - Remove `sortListsAlphabetically`

- Updated dependencies [85cb44a9](https://github.com/keystonejs/keystone-5/commit/85cb44a9):
  - @arch-ui/navbar@0.0.4

## 3.0.2

- [patch][5ddb2ed6](https://github.com/keystonejs/keystone-5/commit/5ddb2ed6):

  - Always display clickable links when starting a server in dev mode

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):
  - @keystone-alpha/fields@3.0.1
  - @keystone-alpha/utils@2.0.0

## 3.0.1

- [patch][f12a2a80](https://github.com/keystonejs/keystone-5/commit/f12a2a80):

  - Fix running Babel on Admin UI src when on npm

## 3.0.0

- [major][9a9f214a](https://github.com/keystonejs/keystone-5/commit/9a9f214a):

  - Build field type views before publishing to npm and stop running Babel on Keystone packages in node_modules in the Admin UI

- [major][de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):

  - Update authStrategy APIs
    - Removes `authStrategy` from the `config` API of `Webserver`.
    - Removes `authStrategy` from the `serverConfig` of the core `keystone` system builder.
    - Removes the `setAuthStrategy` method from `AdminUI`.
    - Adds `authStrategy` to the `config` API of `AdminUI`.
    - `Webserver` checks `keystone.auth` to determine whether to set up auth session middlewares.

- [major][4ed35dfd](https://github.com/keystonejs/keystone-5/commit/4ed35dfd):

  - Remove methods from `AdminUI` class:
    - `redirectSuccessfulSignin`
    - `signin`
    - `signout`
    - `session`

## 2.0.0

- [major][dcb93771](https://github.com/keystonejs/keystone-5/commit/dcb93771):

  - Put field type views onto field controllers

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][3a775092](https://github.com/keystonejs/keystone-5/commit/3a775092):

  - Update dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone-5/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

- [patch][d9a1be91](https://github.com/keystonejs/keystone-5/commit/d9a1be91):

  - Update dependencies

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

## 1.1.0

- [minor][91557b24](https://github.com/keystonejs/keystone-5/commit/91557b24):

  - Make links in terminal clicky where possible

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

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
