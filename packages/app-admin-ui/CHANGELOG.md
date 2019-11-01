# @keystonejs/app-admin-ui

## 5.0.1

### Patch Changes

- [`19b08a30`](https://github.com/keystonejs/keystone/commit/19b08a30b3dbfb7c7a0056f210769bbf6e171c85) [#1806](https://github.com/keystonejs/keystone/pull/1806) Thanks [@gautamsi](https://github.com/gautamsi)! - indicate which list is auth list by adding a person icon afetr label

- Updated dependencies [[`209b7078`](https://github.com/keystonejs/keystone/commit/209b7078c7fa4f4d87568c58cb6cb6ad8162fe46)]:
  - @keystonejs/fields@5.0.1

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/build-field-types@5.0.0
  - @keystonejs/field-views-loader@5.0.0
  - @keystonejs/fields@5.0.0
  - @keystonejs/session@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/app-admin-ui

## 5.10.3

### Patch Changes

- [`a8ee0179`](https://github.com/keystonejs/keystone-5/commit/a8ee0179842f790dd3b5d4aae3524793e752ee26) [#1805](https://github.com/keystonejs/keystone-5/pull/1805) Thanks [@gautamsi](https://github.com/gautamsi)! - export `useAdminMeta` which is useful in developing custom pages

- Updated dependencies [[`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/fields@15.0.0

## 5.10.2

### Patch Changes

- Updated dependencies [[`68134f7a`](https://github.com/keystonejs/keystone-5/commit/68134f7ac6d56122640c42304ab8796c1aa2f17c), [`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/field-views-loader@2.2.1
  - @keystone-alpha/fields@14.0.0

## 5.10.1

### Patch Changes

- [afcc2fa4](https://github.com/keystonejs/keystone-5/commit/afcc2fa4): Fix Admin UI redirects in prod mode
- [1463d535](https://github.com/keystonejs/keystone-5/commit/1463d535): Update documentation for the Admin UI app.

* Updated dependencies [464d7579](https://github.com/keystonejs/keystone-5/commit/464d7579):
  - @keystone-alpha/fields@13.1.0
  - @arch-ui/select@0.1.0

## 5.10.0

### Minor Changes

- [7ee3b0ad](https://github.com/keystonejs/keystone-5/commit/7ee3b0ad): Display an error toast in the admin-ui if there was an error when creating an item. Also created a custom ToastContainer to fix an issue with z-indexing.

- Updated dependencies [4e6a574d](https://github.com/keystonejs/keystone-5/commit/4e6a574d):
  - @keystone-alpha/fields@13.0.0

## 5.9.0

### Minor Changes

- [b88c4038](https://github.com/keystonejs/keystone-5/commit/b88c4038): When no list is defined the AdminUI will now load with an error message.

## 5.8.2

### Patch Changes

- [8b087627](https://github.com/keystonejs/keystone-5/commit/8b087627): Show correct pluralised value in admin-ui sidebar nav

## 5.8.1

- Updated dependencies [7689753c](https://github.com/keystonejs/keystone-5/commit/7689753c):
- Updated dependencies [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d):
  - @arch-ui/controls@0.0.10
  - @keystone-alpha/fields@12.0.0
  - @arch-ui/input@0.1.0

## 5.8.0

### Minor Changes

- [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d): `Keystone`, `List` and `Field` constructors now take `schemaNames` as config options. A number of methods also now take `schemaName` parameters.
  - `keystone.getTypeDefs()` -> `keystone.getTypeDefs({ schemaName })`
  - `keystone.getAdminSchema()` -> `keystone.getAdminSchema({ schemaName })`
  - `keystone.dumpSchema(file)` -> `keystone.dumpSchema(file, schemaName)`
  - `keystone.getAdminMeta()` -> `keystone.getAdminMeta({ schemaName })`
  - `list.getAdminMeta()` -> `list.getAdminMeta({ schemaName })`
  - `field.getAdminMeta()` -> `field.getAdminMeta({ schemaName })`

### Patch Changes

- [087ceeac](https://github.com/keystonejs/keystone-5/commit/087ceeac): Add robots exclusion meta tags to Admin UI

- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
  - @keystone-alpha/fields@11.0.0

## 5.7.0

### Minor Changes

- [2350a9fd](https://github.com/keystonejs/keystone-5/commit/2350a9fd): Admin UI has a new config option: `isAccessAllowed({ authentication: { user, listKey } }) => Boolean` to restrict who can login to the Admin UI.

## 5.6.1

### Patch Changes

- [99dc6cae](https://github.com/keystonejs/keystone-5/commit/99dc6cae): Revert usage of Apollo Hooks

## 5.6.0

### Minor Changes

- [79e362c0](https://github.com/keystonejs/keystone-5/commit/79e362c0): upgrade react-apollo and use hooks instead of Query and Mutation components

## 5.5.2

### Patch Changes

- [b822d229](https://github.com/keystonejs/keystone-5/commit/b822d229): fix issue related to react-toast-notifications update. toasts are not triggered after delete success.

## 5.5.1

### Patch Changes

- [30f6b7eb](https://github.com/keystonejs/keystone-5/commit/30f6b7eb): upgraded `react-toast-notifications` to `2.2.4`. use `useToasts` hook when possible.

## 5.5.0

### Minor Changes

- [f7ba8a35](https://github.com/keystonejs/keystone-5/commit/f7ba8a35): Prefill nested creates for Relationship fields with back referennces

## 5.4.0

### Minor Changes

- [33ed590e](https://github.com/keystonejs/keystone-5/commit/33ed590e): Respect static field-level access control in the Admin UI

## 5.3.0

### Minor Changes

- [da65e1a0](https://github.com/keystonejs/keystone-5/commit/da65e1a0): Allow display and filtering of 'Id' column in Admin UI

## 5.2.0

### Minor Changes

- [e049cfcb](https://github.com/keystonejs/keystone-5/commit/e049cfcb): Support defaultValue as a function in view Controllers

### Patch Changes

- [957a40d9](https://github.com/keystonejs/keystone-5/commit/957a40d9): Upgrade react-select

- Updated dependencies [fc437e06](https://github.com/keystonejs/keystone-5/commit/fc437e06):
  - @keystone-alpha/fields@10.2.0
  - @arch-ui/drawer@0.0.10

## 5.1.0

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade emotion to 10.0.14
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade graphql to 14.4.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Fixing minor potential perf issue, flagged by DeepCheck
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

## 5.0.4

- Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):
  - @keystone-alpha/fields@9.0.0

## 5.0.3

### Patch Changes

- [a6c3ac0c](https://github.com/keystonejs/keystone-5/commit/a6c3ac0c):

  Stop re-rendering ItemTitle on every change in an Item

* Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):
  - @keystone-alpha/fields@8.0.0

## 5.0.2

### Patch Changes

- [c2dc6eb3](https://github.com/keystonejs/keystone-5/commit/c2dc6eb3):

  Replace custom copy to clipboard utility with the clipboard-copy package

- [c2dc6eb3](https://github.com/keystonejs/keystone-5/commit/c2dc6eb3):

  Remove Admin UI style guide. The style guide is now in the keystone-5 repo at packages/arch/docs

* Updated dependencies [c2dc6eb3](https://github.com/keystonejs/keystone-5/commit/c2dc6eb3):
  - @arch-ui/navbar@0.1.0

## 5.0.1

### Patch Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Correctly send user to Admin UI after logging in (under some circumstances, it would just show the word "Error")

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Correctly sign the user out when clicking the icon in the Admin UI

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @keystone-alpha/fields@7.1.0
  - @arch-ui/fields@2.0.0
  - @arch-ui/controls@0.0.8
  - @arch-ui/input@0.0.8

## 5.0.0

### Major Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):

  - Removed the `<adminPath>/signin`, `<adminPath>/signout`, and
    `<adminPath>/session` routes.
    - The REST routes have been replaced with GraphQL mutations
      `authenticate<List>With<Strategy>` & `unauthenticate<List>` (see
      `@keystone-alpha/keystone`'s `CHANGELOG.md` for details)
  - Admin UI now uses the new `(un)authenticate` mutations for sigin/signout
    pages.
  - Signout page correctly renders again (previously was erroring and showing a
    blank page)
  - Generate Admin UI login form field labels based on the identity and secret
    fields set in the PasswordAuthStrategy.

### Minor Changes

- [abce2e6c](https://github.com/keystonejs/keystone-5/commit/abce2e6c):

  `<Field>` views now receive a `savedValue` prop representing the current state as saved to the database.

- [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):

  - Execute the new `validateInput()` method from fields before saving on
    create/update pages.
  - Any generated `warnings` or `errors` are passed to the `<Field>` component for
    the component to display to the user.
  - Any `errors` will cause the Primary button (_Create_, _Update_) to be disabled
    until there are no more errors.
  - Any `warnings` will cause the Primary button (_Create_, _Update_) to require a
    confirmation (ie; warnings can be ignored, errors cannot)

### Patch Changes

- [5c28c142](https://github.com/keystonejs/keystone-5/commit/5c28c142):

  Silence a useless warning produced by Apollo when using the OEmbed field

- [dc2cd8e5](https://github.com/keystonejs/keystone-5/commit/dc2cd8e5):

  Allow changing to default dashboard to a custom component

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
* Updated dependencies [16befb6a](https://github.com/keystonejs/keystone-5/commit/16befb6a):
  - @keystone-alpha/fields@7.0.0
  - @keystone-alpha/session@2.0.0
  - @arch-ui/fields@1.0.0

## 4.0.0

### Major Changes

- This packages has been renamed from `admin-ui`.

- [dfcabe6a](https://github.com/keystonejs/keystone-5/commit/dfcabe6a):

  Specify custom servers from within the index.js file

  - Major Changes:
    - The `index.js` export for `admin` must now be exported in the `servers`
      array:
      ```diff
       module.exports = {
         keystone,
      -  admin,
      +  apps: [admin],
       }
      ```
    - The `keystone.prepare()` method (often used within a _Custom Server_
      `server.js`) no longer returns a `server`, it now returns a `middlewares`
      array:
      ```diff
      +const express = require('express');
       const port = 3000;
       keystone.prepare({ port })
      -  .then(async ({ server, keystone: keystoneApp }) => {
      +  .then(async ({ middlewares, keystone: keystoneApp }) => {
           await keystoneApp.connect();
      -    await server.start();
      +    const app = express();
      +    app.use(middlewares);
      +    app.listen(port)
         });
      ```

- [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):

  Remove usage of `port` arg from `prepareMiddleware()` and stop doing inline console.logs

- [8494e4cc](https://github.com/keystonejs/keystone-5/commit/8494e4cc):

  `@keystone-alpha/app-admin-ui` no longer accepts a `keystone` paramater in its constructor. It is now automatically passed during the `keystone.prepare()` call.

### Patch Changes

- [991c6df0](https://github.com/keystonejs/keystone-5/commit/991c6df0):

  Fix react-router-dom error when installed through npm

- [dfcabe6a](https://github.com/keystonejs/keystone-5/commit/dfcabe6a):

  Remove unused dependency

- [dfcabe6a](https://github.com/keystonejs/keystone-5/commit/dfcabe6a):

  Fix Admin UI building on Windows

# @keystonejs/admin-ui

# @keystone-alpha/admin-ui

## 3.2.1

### Patch Changes

- [d580c298](https://github.com/keystonejs/keystone-5/commit/d580c298):

  Minor Admin UI Tweaks

- [adec8047](https://github.com/keystonejs/keystone-5/commit/adec8047):

  Use babel-preset-react-app in the Admin UI

- [7a513e8f](https://github.com/keystonejs/keystone-5/commit/7a513e8f):

  Fix non-stop renders on list pages

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
