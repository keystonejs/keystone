# @keystonejs/access-control

## 7.0.0

### Major Changes

- [`28a61dc67`](https://github.com/keystonejs/keystone/commit/28a61dc67b990ebd16bfc4e1c0a1e9ffb0e54d81) [#4801](https://github.com/keystonejs/keystone/pull/4801) Thanks [@timleslie](https://github.com/timleslie)! - Converted the `@keystonejs/access-control` package to TypeScript.

## 6.3.2

### Patch Changes

- [`619ef5051`](https://github.com/keystonejs/keystone/commit/619ef50512c09d7cf988dc3c877eed868eba68a6) [#4730](https://github.com/keystonejs/keystone/pull/4730) Thanks [@timleslie](https://github.com/timleslie)! - Refactored access parsing to separate parsing from validation.

* [`86b597d41`](https://github.com/keystonejs/keystone/commit/86b597d410c907ed54a4948da438de48e313302f) [#4724](https://github.com/keystonejs/keystone/pull/4724) Thanks [@timleslie](https://github.com/timleslie)! - Rearranged code to have an explicit exports group.

- [`c1257ca83`](https://github.com/keystonejs/keystone/commit/c1257ca834ccf5a0407debe6e7d27b45ed32a26a) [#4727](https://github.com/keystonejs/keystone/pull/4727) Thanks [@timleslie](https://github.com/timleslie)! - Refactored out `parseAccess` and added `checkSchemaNames`.

* [`5e22cc765`](https://github.com/keystonejs/keystone/commit/5e22cc765a8f18c467457fd2ba738cd90273c8c5) [#4725](https://github.com/keystonejs/keystone/pull/4725) Thanks [@timleslie](https://github.com/timleslie)! - Refactored calls to `validateGranularConfigTypes` to be more explicit.

- [`b9ec7fff9`](https://github.com/keystonejs/keystone/commit/b9ec7fff9d96ac56e2836543d698cf0b62b5dc8f) [#4723](https://github.com/keystonejs/keystone/pull/4723) Thanks [@timleslie](https://github.com/timleslie)! - Replaced usage of `getType()` with `typeof`.

* [`5ad7c12e8`](https://github.com/keystonejs/keystone/commit/5ad7c12e86573e73e85368076bdc1296f3f69db3) [#4726](https://github.com/keystonejs/keystone/pull/4726) Thanks [@timleslie](https://github.com/timleslie)! - Refactored `parseAccess` and inlined the code from `validateGranularConfigTypes` and `parseAccessCore`.

* Updated dependencies [[`94c8d349d`](https://github.com/keystonejs/keystone/commit/94c8d349d3795cd9abec407f78752417623ee56f)]:
  - @keystonejs/utils@6.0.1

## 6.3.1

### Patch Changes

- Updated dependencies [[`b76241695`](https://github.com/keystonejs/keystone/commit/b7624169554b01dba2185ef43856a223d32f12be)]:
  - @keystonejs/utils@6.0.0

## 6.3.0

### Minor Changes

- [`5a3849806`](https://github.com/keystonejs/keystone/commit/5a3849806d00e62b722461d02f6e4639bc45c1eb) [#3262](https://github.com/keystonejs/keystone/pull/3262) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added a new private internal schema that will allow a better method of bypassing access control on the `executeGraphQL` function.

  The schema name `internal` is now a reserved name and if you have a schema with this name you will need to change it with this update.

  Note: You cannot change access control on the `internal` schema.

## 6.2.0

### Minor Changes

- [`dec3d336a`](https://github.com/keystonejs/keystone/commit/dec3d336adbe8156722fbe65f315a57b2f5c08e7) [#3153](https://github.com/keystonejs/keystone/pull/3153) Thanks [@timleslie](https://github.com/timleslie)! - Made `context` available to user designed access control functions.

## 6.1.0

### Minor Changes

- [`463f55233`](https://github.com/keystonejs/keystone/commit/463f552335013d5ba9ebf2e8f7a9ebf8e2b0e0db) [#3095](https://github.com/keystonejs/keystone/pull/3095) Thanks [@timleslie](https://github.com/timleslie)! - Added `{ item, args, context, info, gqlName }` to the arguments available in access control functions for custom queries/mutations.

## 6.0.0

### Major Changes

- [`839666e25`](https://github.com/keystonejs/keystone/commit/839666e25d8bffefd034e6344e11d72dd43b925b) [#2872](https://github.com/keystonejs/keystone/pull/2872) Thanks [@wcalebgray](https://github.com/wcalebgray)! - Added async capability for all Access Control resolvers. This changes the below methods to async functions, returning Promises:

  ```
  access-control
  - validateCustomAccessControl
  - validateListAccessControl
  - validateFieldAccessControl
  - validateAuthAccessControl

  keystone/List
  - checkFieldAccess
  - checkListAccess

  keystone/providers/custom
  - computeAccess

  keystone/providers/listAuth
  - checkAccess

  ```

  Changed `keystone/Keystone`'s `getGraphQlContext` return object (context) to include async resolvers for the following methods:

  ```
  - context.getCustomAccessControlForUser
  - context.getListAccessControlForUser
  - context.getFieldAccessControlForUser
  - context.getAuthAccessControlForUser
  ```

## 5.2.0

### Minor Changes

- [`42497b8e`](https://github.com/keystonejs/keystone/commit/42497b8ebbaeaf0f4d7881dbb76c6abafde4cace) [#2456](https://github.com/keystonejs/keystone/pull/2456) Thanks [@timleslie](https://github.com/timleslie)! - Added `validateAuthAccessControl` as a special case for validating access control on authentication queries and mutations.

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

- Updated dependencies [[`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20)]:
  - @keystonejs/utils@5.2.2

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

### Patch Changes

- Updated dependencies [[`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf)]:
  - @keystonejs/utils@5.2.0

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/utils@5.0.0

# @keystone-alpha/access-control

## 3.1.0

### Minor Changes

- [1405eb07](https://github.com/keystonejs/keystone/commit/1405eb07): Add `listKey`, `fieldKey` (fields only), `operation`, `gqlName`, `itemId` and `itemIds` as arguments to imperative access control functions.

## 3.0.0

### Major Changes

- [9ade2b2d](https://github.com/keystonejs/keystone/commit/9ade2b2d): Add support for `access: { auth: ... }` which controls whether authentication queries and mutations are accessible on a List

  If you have a `List` which is being used as the target of an Authentication Strategy, you should set `access: { auth: true }` on that list.

### Minor Changes

- [b61289b4](https://github.com/keystonejs/keystone/commit/b61289b4): Add `parseCustomAccess()` for parsing the access control directives on custom types/queries/mutations.
- [0bba9f07](https://github.com/keystonejs/keystone/commit/0bba9f07): Add `validateCustomAccessControl()` for use by custom queries/mutations access control checking.

### Patch Changes

- [9ece715c](https://github.com/keystonejs/keystone/commit/9ece715c): Refactor access-control internals to better support future changes

## 2.0.0

### Major Changes

- [bc0b9813](https://github.com/keystonejs/keystone/commit/bc0b9813): `parseListAccess` and `parseFieldAccess` now take `schemaNames` as an argument, and return a nested access object, with the `schemaNames` as keys.

  For example,

  ```js
  parseListAccess({ defaultAccess: false, access: { public: true }, schemaNames: ['public', 'private'] }
  ```

  will return

  ```js
  {
    public: { create: true, read: true, update: true, delete: true },
    private: { create: false, read: false, update: false, delete: false },
  }
  ```

  These changes are backwards compatible with regard to the `access` argument, so

  ```js
  const access = { create: true, read: true, update: true, delete: true };
  parseListAccess({ access, schemaNames: ['public', 'private'] }
  ```

  will return

  ```js
  {
    public: { create: true, read: true, update: true, delete: true },
    private: { create: true, read: true, update: true, delete: true },
  }
  ```

## 1.1.0

### Minor Changes

- [e5d4ee76](https://github.com/keystonejs/keystone/commit/e5d4ee76): Expose 'originalInput' to access control functions for lists & fields

## 1.0.5

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 1.0.4

- Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone/commit/b7a2ea9c):
  - @keystone-alpha/utils@3.0.0

## 1.0.3

- [patch][10d96db2](https://github.com/keystonejs/keystone/commit/10d96db2):

  - Restructure internal code

## 1.0.2

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone/commit/98c02a46):
  - @keystone-alpha/utils@2.0.0

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/access-control

## 0.4.2

- [patch] 113e16d4:

  - Remove unused dependencies

## 0.4.1

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [a3d5454d]:
  - @voussoir/utils@1.0.0

## 0.4.0

- [minor] ffc98ac4:

  - Rename the access control function parameter `item` to `existingItem`

## 0.3.0

- [minor] 3ae588b7:

  - Rename test*AccessControl functions to validate*AccessControl

## 0.2.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.1.3

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/utils@0.2.0

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
