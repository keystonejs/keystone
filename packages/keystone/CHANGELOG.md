# @keystonejs/keystone

## 5.1.0

### Minor Changes

- [`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469) [#1851](https://github.com/keystonejs/keystone/pull/1851) Thanks [@jesstelford](https://github.com/jesstelford)! - Added runtime database version validation

### Patch Changes

- Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469), [`ebbcad70`](https://github.com/keystonejs/keystone/commit/ebbcad7042596a9c83c32c8e08dad50f9fcb59fd), [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f)]:
  - @keystonejs/utils@5.1.0
  - @keystonejs/fields@5.0.2

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/access-control@5.0.0
  - @keystonejs/app-graphql@5.0.0
  - @keystonejs/build-field-types@5.0.0
  - @keystonejs/fields@5.0.0
  - @keystonejs/logger@5.0.0
  - @keystonejs/session@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/keystone

## 16.1.0

### Minor Changes

- [`3bc02545`](https://github.com/keystonejs/keystone-5/commit/3bc025452fb8e6e69790bdbee032ddfdeeb7dabb) [#1803](https://github.com/keystonejs/keystone-5/pull/1803) Thanks [@Vultraz](https://github.com/Vultraz)! - Disallow leading underscores in list and field names

* [`a48281ba`](https://github.com/keystonejs/keystone-5/commit/a48281ba605bf5bebc89fcbb36d3e69c17182eec) [#1783](https://github.com/keystonejs/keystone-5/pull/1783) Thanks [@timleslie](https://github.com/timleslie)! - The `keystone` cli now accepts a return of `{ keystone, apps, configureExpress }` from the entry file. `configureExpress` will be called on the Express app before applying the keystone middlewares.

### Patch Changes

- [`0a36b0f4`](https://github.com/keystonejs/keystone-5/commit/0a36b0f403da73a76106b5e14940a789466b4f94) [#1784](https://github.com/keystonejs/keystone-5/pull/1784) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed adapterConnectOptions key (unused as of 144e6e86)

* [`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901) [#1789](https://github.com/keystonejs/keystone-5/pull/1789) Thanks [@timleslie](https://github.com/timleslie)! - `Relationship.convertResolvedOperationsToFieldValue()` has been removed.

* Updated dependencies [[`7129c887`](https://github.com/keystonejs/keystone-5/commit/7129c8878a825d961f2772be497dcd5bd6b2b697), [`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901)]:
  - @keystone-alpha/app-graphql@8.2.1
  - @keystone-alpha/fields@15.0.0

## 16.0.1

### Patch Changes

- [`b0aee895`](https://github.com/keystonejs/keystone-5/commit/b0aee895f664cf5665fa700e68ffc532c35f424d) [#1776](https://github.com/keystonejs/keystone-5/pull/1776) Thanks [@jesstelford](https://github.com/jesstelford)! - Avoid the build command from hanging when an entry file may have a long-running process.

## 16.0.0

### Major Changes

- [`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9) [#1729](https://github.com/keystonejs/keystone-5/pull/1729) Thanks [@timleslie](https://github.com/timleslie)! - This change significantly changes how and when we populate `many`-relationships during queries and mutations.
  The behaviour of the GraphQL API has not changed, but queries should be more performant, particularly for items with many related items.
  The `existingItem` parameter in hooks will no longer have the `many`-relationship fields populated.
  `List.listQuery()` no longer populates `many` relationship fields.
  For most users there should not need to be any changes to code unless they are explicitly relying on a `many`-relationship field in a hook, in which case they will need to execute an explicit query to obtain the desired values.

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/fields@14.0.0

## 15.4.1

### Patch Changes

- [14fee364](https://github.com/keystonejs/keystone-5/commit/14fee364): Correctly pass `gqlName` for all access checks

## 15.4.0

### Minor Changes

- [b12e4ccb](https://github.com/keystonejs/keystone-5/commit/b12e4ccb): Add a global maxTotalResults limit to Keystone object
- [1405eb07](https://github.com/keystonejs/keystone-5/commit/1405eb07): Add `listKey`, `fieldKey` (fields only), `operation`, `gqlName`, `itemId` and `itemIds` as arguments to imperative access control functions.

### Patch Changes

- [3a52447d](https://github.com/keystonejs/keystone-5/commit/3a52447d): Update `getAccessControlledItem()` to remove short-circuit code which code lead to future data inconsistency.
- [65d32b54](https://github.com/keystonejs/keystone-5/commit/65d32b54): Fix session storage

## 15.3.1

### Patch Changes

- [b2c5277e](https://github.com/keystonejs/keystone-5/commit/b2c5277e): Use compose() function from utils package.

- Updated dependencies [4e6a574d](https://github.com/keystonejs/keystone-5/commit/4e6a574d):
  - @keystone-alpha/fields@13.0.0

## 15.3.0

### Minor Changes

- [552e6fb6](https://github.com/keystonejs/keystone-5/commit/552e6fb6): Add support for schema cache hints

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 15.2.1

### Patch Changes

- [d218cd55](https://github.com/keystonejs/keystone-5/commit/d218cd55): Make executeQuery() backwards compatible with old, single-schema KS

## 15.2.0

### Minor Changes

- [b9e2c45b](https://github.com/keystonejs/keystone-5/commit/b9e2c45b): Add support for query validation

## 15.1.2

### Patch Changes

- [258424d7](https://github.com/keystonejs/keystone-5/commit/258424d7): Correctly pass `originalInput` argument through to `beforeChange()` and `afterChange()` hooks.

## 15.1.1

### Patch Changes

- [bb3b389b](https://github.com/keystonejs/keystone-5/commit/bb3b389b): Correctly apply access control to gqlAuxFieldResolvers()

## 15.1.0

### Minor Changes

- [f56ffdfd](https://github.com/keystonejs/keystone-5/commit/f56ffdfd): Apply access control to auxiliary lists

### Patch Changes

- [42a45bbd](https://github.com/keystonejs/keystone-5/commit/42a45bbd): Remove hard-coded paths from app build process

## 15.0.0

### Major Changes

- [b61289b4](https://github.com/keystonejs/keystone-5/commit/b61289b4): Allow passing `{ access: ...}` when calling `keystone.extendGraphQLSchema()`. The `types` argument is now a list of objects of the form `{ access: ..., type: ...}`, rather than a list of strings.
- [0bba9f07](https://github.com/keystonejs/keystone-5/commit/0bba9f07): Check access control on custom queries/mutations before executing custom resolvers.
- [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d): Add support for `access: { auth: ... }` which controls whether authentication queries and mutations are accessible on a List

  If you have a `List` which is being used as the target of an Authentication Strategy, you should set `access: { auth: true }` on that list.

### Patch Changes

- [857386db](https://github.com/keystonejs/keystone-5/commit/857386db): Fix bug where a schema with no mutations would fail at schema generation time
- [d253220f](https://github.com/keystonejs/keystone-5/commit/d253220f): Updates the arg package that resolves a possible bug with connection strings in the CLI
- [9498c690](https://github.com/keystonejs/keystone-5/commit/9498c690): Fix meta queries with maxResults limits

## 14.0.0

### Major Changes

- [decf7319](https://github.com/keystonejs/keystone-5/commit/decf7319): Remove `skipAccessControl` option from `keystone.getTypeDefs()`, `List.getGqlTypes()`, `List.getGqlQueries()`, and `List.getGqlMutations()`.
- [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9): The `.access` property of Lists is now keyed by `schemaName`. As such, a number of getters and methods have been replaced with methods which take `{ schemaName }`.

  - `getGqlTypes()` -> `getGqlTypes({ schemaName })`
  - `getGqlQueries()` -> `getGqlQueries({ schemaName })`
  - `get gqlFieldResolvers()` -> `gqlFieldResolvers({ schemaName })`
  - `get gqlAuxFieldResolvers()` -> `gqlAuxFieldResolvers({ schemaName })`
  - `get gqlAuxQueryResolvers()` -> `gqlAuxQueryResolvers({ schemaName })`
  - `get gqlAuxMutationResolvers()` -> `gqlAuxMutationResolvers({ schemaName })`
  - `getGqlMutations()` -> `getGqlMutations({ schemaName })`
  - `get gqlQueryResolvers()` -> `gqlQueryResolvers({ schemaName })`
  - `get gqlMutationResolvers()` -> `gqlMutationResolvers({ schemaName })`

- [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d): `Keystone`, `List` and `Field` constructors now take `schemaNames` as config options. A number of methods also now take `schemaName` parameters.
  - `keystone.getTypeDefs()` -> `keystone.getTypeDefs({ schemaName })`
  - `keystone.getAdminSchema()` -> `keystone.getAdminSchema({ schemaName })`
  - `keystone.dumpSchema(file)` -> `keystone.dumpSchema(file, schemaName)`
  - `keystone.getAdminMeta()` -> `keystone.getAdminMeta({ schemaName })`
  - `list.getAdminMeta()` -> `list.getAdminMeta({ schemaName })`
  - `field.getAdminMeta()` -> `field.getAdminMeta({ schemaName })`

### Minor Changes

- [0a627ef9](https://github.com/keystonejs/keystone-5/commit/0a627ef9): Adds a `cookieMaxAge` and `secureCookies` option to the keystone constructor.

  These will default to 30 days for `cookieMaxAge` and `true` in production `false` in other environments for `secureCookies`.

  ### Usage

  ```javascript
  const keystone = new Keystone({
    cookieMaxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secureCookies: true,
  });
  ```

  Note: `commonSessionMiddleware` now accepts a config object rather than multiple arguments.

- [f8ad0975](https://github.com/keystonejs/keystone-5/commit/f8ad0975): The `cors` and `pinoOptions` parameters now live on `keystone.prepare()` rather than `new GraphQLApp()`

### Patch Changes

- [bc0b9813](https://github.com/keystonejs/keystone-5/commit/bc0b9813): `parseListAccess` and `parseFieldAccess` now take `schemaNames` as an argument, and return a nested access object, with the `schemaNames` as keys.

  For example,

  ```js
  parseListAccess({ defaultAccess: false, access: { public: true }, schemaNames: ['public', 'internal'] }
  ```

  will return

  ```js
  {
    public: { create: true, read: true, update: true, delete: true },
    internal: { create: false, read: false, update: false, delete: false },
  }
  ```

  These changes are backwards compatible with regard to the `access` argument, so

  ```js
  const access = { create: true, read: true, update: true, delete: true };
  parseListAccess({ access, schemaNames: ['public', 'internal'] }
  ```

  will return

  ```js
  {
    public: { create: true, read: true, update: true, delete: true },
    internal: { create: true, read: true, update: true, delete: true },
  }
  ```

- [76c3efa9](https://github.com/keystonejs/keystone-5/commit/76c3efa9): `keystone.getGraphQlContext()` no longer provides a default value for `schemaName`.

- Updated dependencies [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9):
  - @keystone-alpha/fields@11.0.0

## 13.1.0

### Minor Changes

- [63350996](https://github.com/keystonejs/keystone-5/commit/63350996): Add queryLimits and maxResults to List API

## 13.0.0

### Major Changes

- [8d0d98c7](https://github.com/keystonejs/keystone-5/commit/8d0d98c7): `cookieSecret` and `sessionStore` config options are now passed to the `Keystone` constructor instead of the individual auth or graphql packages.

### Minor Changes

- [8bb1bb0e](https://github.com/keystonejs/keystone-5/commit/8bb1bb0e): Add a `keystone.executeQuery()` method to run GraphQL queries and mutations directly against a Keystone instance. NOTE: These queries are executed without any Access Control checks by default.

## 12.0.1

### Patch Changes

- [1a20fd27](https://github.com/keystonejs/keystone-5/commit/1a20fd27): Fix bug with custom query/mutation resolvers

## 12.0.0

### Major Changes

- [33001656](https://github.com/keystonejs/keystone-5/commit/33001656): \* Added `keystone.extendGraphQLSchema()` as the interface for custom mutations and queries.

  ```javascript
  keystone.extendGraphQLSchema({
    types: ['type Foo { foo: Int }', ...],
    queries: [{ schema: '...', resolver: () => {} }, ...],
    mutations: [{ schema: '...', resolver: () => {} }, ...],
  });
  ```

  - `new List()` and `keystone.createList()` no longer accept `queries` or `mutations` options! Please use `extendGraphQLSchema()` instead.

## 11.0.0

### Major Changes

- [e42fdb4a](https://github.com/keystonejs/keystone-5/commit/e42fdb4a): Makes the password auth strategy its own package.
  Previously: `const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');`
  After change: `const { PasswordAuthStrategy } = require('@keystone-alpha/auth-password');`

## 10.5.0

### Minor Changes

- [b86f0e26](https://github.com/keystonejs/keystone-5/commit/b86f0e26): Renames the package `@keystone-alpha/passport-auth` to `@keystone-alpha/auth-passport`. Anyone using `passport-auth` should switch over to the new package - the old one will no longer be receiving updates.

## 10.4.0

### Minor Changes

- [d3238352](https://github.com/keystonejs/keystone-5/commit/d3238352): Implemented custom queries in the same format as custom mutations.

## 10.3.0

### Minor Changes

- [759a3c17](https://github.com/keystonejs/keystone-5/commit/759a3c17): Add a `types` property to custom mutations.

## 10.2.0

### Minor Changes

- [e5d4ee76](https://github.com/keystonejs/keystone-5/commit/e5d4ee76): Expose 'originalInput' to access control functions for lists & fields

## 10.1.0

### Minor Changes

- [36616092](https://github.com/keystonejs/keystone-5/commit/36616092): Added `plugins` option to the config of `createList`

## 10.0.0

### Major Changes

- [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86): - API Changes to Adapters: - Configs are now passed directly to the adapters rather than via `adapterConnectOptions`. - Default connections strings changed for both Knex and Mongoose adapters to be more inline with system defaults. - `keystone.connect()` no longer accepts a `to` paramter - the connection options must be passed to the adapter constructor (as above).

### Minor Changes

- [e049cfcb](https://github.com/keystonejs/keystone-5/commit/e049cfcb): Support defaultValue as a function at mutation execution time

## 9.1.0

### Minor Changes

- [d7819a55](https://github.com/keystonejs/keystone-5/commit/d7819a55): Run .resolveInput() on all fields/field hooks regardless of if data has been passed as part of the mutation. This enables .resolveInput() to be run on fields without data during an update mutation.

## 9.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Adding isIndexed field config and support for in most field types

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Check for the number type in label resolver to prevent false positive on zero.
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade prettier to 1.18.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Ensure resolveInput for list receives result from fields
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade graphql to 14.4.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade promise utility dependencies
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

## 8.0.0

### Major Changes

- [4007f5dd](https://github.com/keystonejs/keystone-5/commit/4007f5dd):

  Adding field instance to the BaseFieldAdapter constructor arguments

### Patch Changes

- [18064167](https://github.com/keystonejs/keystone-5/commit/18064167):

  Adding `knexOptions` to the KnexFieldAdapter to support DB-level config for nullability (`isNotNullable`) and defaults (`defaultTo`)

## 7.0.3

### Patch Changes

- [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):

  Refactoring the knex adapter (and field adapters) to give the field type more control of the table schema (add 0 or multiple columns, etc)

## 7.0.2

### Patch Changes

- [04371d0d](https://github.com/keystonejs/keystone-5/commit/04371d0d):

  Don't error when Auth Strategy doesn't provide getInputFragment() or validate() method.

* Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):
  - @keystone-alpha/fields@8.0.0

## 7.0.1

### Patch Changes

- [de9e709d](https://github.com/keystonejs/keystone-5/commit/de9e709d):

  Convert GraphQL SDL to AST before passing to Apollo

  Apollo released a breaking change in a semver-minor which causes it to
  stop understanding the SDL (string) GraphQL typeDefs we were passing it.
  This fix ensures we're converting to an AST to avoid the error being
  thrown.

  See https://github.com/keystonejs/keystone-5/issues/1340

## 7.0.0

### Major Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Gather views from fields via the renamed method `#extendAdminViews()` (was `#extendViews()`)

### Patch Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Correctly read `--connect-to` option on the CLI

## 6.0.0

### Major Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):

  - `PasswordAuthStrategy#validate()` now accepts an object of `{ [identityField], [secretField] }` (was `{ identity, secret }`).
  - Auth Strategies can now add AdminMeta via a `#getAdminMeta()` method which will be attached to the `authStrategy` key of `adminMeta` in the Admin UI.
  - Added (un)authentication GraphQL mutations:
    - ```graphql
      mutation {
        authenticate<List>With<Strategy>(<strategy-args) {
          token # Add this token as a header: { Authorization: 'Bearer <token>' }
          item # The authenticated item from <List>
        }
      }
      ```
      For the `PasswordAuthStrategy`, that is:
      ```javascript
      const authStrategy = keystone.createAuthStrategy({
        type: PasswordAuthStrategy,
        list: 'User',
        config: {
          identityField: 'username',
          secretField: 'pass',
        },
      });
      ```
      ```graphql
      mutation {
        authenticateUserWithPassword(username: "jesstelford", pass: "abc123") {
          token
          item {
            username
          }
        }
      }
      ```
    - ```graphql
      mutation {
        unauthenticate<List> {
          success
        }
      }
      ```

### Patch Changes

- [3958a9c7](https://github.com/keystonejs/keystone-5/commit/3958a9c7):

  Fields configured with isRequired now behave as expected on create and update, returning a validation error if they are null.

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

- [b69a2276](https://github.com/keystonejs/keystone-5/commit/b69a2276):

  Removed unnecessary port parameter from keystone.prepare calls

- [ec9e6e2a](https://github.com/keystonejs/keystone-5/commit/ec9e6e2a):

  Fixed behaviour of isRequired within update operations.

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
  - @keystone-alpha/fields@7.0.0
  - @keystone-alpha/app-graphql@6.1.0
  - @keystone-alpha/session@2.0.0

## 5.0.1

### Patch Changes

- [af3f31dd](https://github.com/keystonejs/keystone-5/commit/af3f31dd):

  Set the default build directory the CLI `keystone start` command

## 5.0.0

### Major Changes

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

### Minor Changes

- [a8061c78](https://github.com/keystonejs/keystone-5/commit/a8061c78):

  Add support for setting PORT and CONNECT_TO environment variables

- [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):

  Improved DX with loading indicators when using keystone CLI

- [a98bce08](https://github.com/keystonejs/keystone-5/commit/a98bce08):

  Add support for an `onConnect` function to be passed to the Keystone constructor, which is called when all adapters have connected.

### Patch Changes

- [ff7547c5](https://github.com/keystonejs/keystone-5/commit/ff7547c5):

  Capture early requests to the keystone server while still booting

* Updated dependencies [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):
  - @keystone-alpha/app-graphql@6.0.0

## 4.0.0

### Major Changes

- [24cd26ee](https://github.com/keystonejs/keystone-5/commit/24cd26ee):

  - Remove `.config` property from `Keystone` and `List` classes

- [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):

  - Moved Social Login Strategies into its own package `@keystone-alpha/passport-auth`.
  - Created base strategy `PassportAuthStrategy`. This enables quick addition of new Social Login Strategy based on PassportJs.
  - Refactored Twitter and Facebook to extend base `PassportAuthStrategy`.
  - Added Google and GitHub Auth Strategy by extending base `PassportAuthStrategy`.
  - Removed `passport` and related dependencies from `@keystone-alpha/keystone`.
  - `test-projects/facebook-login` project is renamed into `test-projects/social-login`
  - `social-login` project now support for social login with Twitter, Facebook, Google and GitHub inbuilt strategies from `@keystone-alpha/passport-auth` along with an example of how to implement your own PassportJs strategy for WordPress in `WordPressAuthStrategy.js`

- [ae5cf6cc](https://github.com/keystonejs/keystone-5/commit/ae5cf6cc):

  - List adapter config must now be specified within the `adapterConfig` field, rather than directly on the `config` object.

- [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):

  Remove custom server execution from the CLI.

  The Keystone CLI does not execute custom servers anymore, instead of running `keystone` to start a Keystone instance that has a custom server, run the server file directly with `node`.

  ```diff
  - "start": "keystone",
  + "start": "node server.js"
  ```

### Minor Changes

- [6f598e83](https://github.com/keystonejs/keystone-5/commit/6f598e83):

  - Add `build` and `start` commands

- [6f598e83](https://github.com/keystonejs/keystone-5/commit/6f598e83):

  - Add Admin UI static building

### Patch Changes

- [211b71c1](https://github.com/keystonejs/keystone-5/commit/211b71c1):

  - Fix bug in resolver for createMany mutations

- [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):

  - Add .isRequired and .isUnique properties to field adapters

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

- [60181234](https://github.com/keystonejs/keystone-5/commit/60181234):

  Use `unique()` from `@keystone-alpha/utils`

- [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):

  Use explicit field properties rather than field.config.

* Updated dependencies [e6e95173](https://github.com/keystonejs/keystone-5/commit/e6e95173):
* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
* Updated dependencies [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
  - @keystone-alpha/fields@6.0.0
  - @keystone-alpha/build-field-types@1.0.0
  - @keystone-alpha/access-control@1.0.4
  - @keystone-alpha/utils@3.0.0

## 3.1.0

- [patch][5180d2fb](https://github.com/keystonejs/keystone-5/commit/5180d2fb):

  - Remove erroneous addition of CRUD operations for Auxiliary Lists from GraphQL API

- [minor][cbe80e61](https://github.com/keystonejs/keystone-5/commit/cbe80e61):

  - Expose GraphQL `context` object to hooks for advanced use cases.

- [patch][ec76b500](https://github.com/keystonejs/keystone-5/commit/ec76b500):

  - Don't exclude aux field resolvers from GraphQL schema

- Updated dependencies [85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):
  - @keystone-alpha/fields@5.0.0

## 3.0.0

- [patch][b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [patch][baff3c89](https://github.com/keystonejs/keystone-5/commit/baff3c89):

  - Use the updated logger API

- [patch][302930a4](https://github.com/keystonejs/keystone-5/commit/302930a4):

  - Minor internal code cleanups

- [major][656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):

  - `WebServer.start()` no longer takes any arguments. Developer must now explicitly call `keystone.connect()` before calling `WebServer.start()`.

- [major][b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):

  - Make all parts of the API available as named exports.

- Updated dependencies [baff3c89](https://github.com/keystonejs/keystone-5/commit/baff3c89):
- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):
  - @keystone-alpha/logger@2.0.0
  - @keystone-alpha/fields@4.0.0

## 2.0.0

- [major][8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):

  - Remove keystone.getAuxQueryResolvers method

- [major][52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):

  - Replace `Keystone.registerGraphQLQueryMethod` with `Keystone.registerSchema`. Add `schemaName` parameter to `getAccessContext`. The `getGraphQLQuery` parameter to `List` now takes a `schemaName` argument. These changes allow us to register more than one ApolloServer instance in our Keystone system.

## 1.0.4

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):
  - @keystone-alpha/access-control@1.0.2
  - @keystone-alpha/fields@3.0.1
  - @keystone-alpha/utils@2.0.0

## 1.0.3

- Updated dependencies [9a9f214a](https://github.com/keystonejs/keystone-5/commit/9a9f214a):
- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):
  - @keystone-alpha/fields@3.0.0
  - @keystone-alpha/core@2.0.0

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone-5/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

- Updated dependencies [dcb93771](https://github.com/keystonejs/keystone-5/commit/dcb93771):
  - @keystone-alpha/fields@2.0.0

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/keystone

## 1.0.0

- [major] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- Updated dependencies [1db45262]:
  - @voussoir/fields@3.1.0
  - @voussoir/core@3.0.0

# @voussoir/core

## 2.1.0

- [minor] 64e6abcc:

  - Allow lists and fields to specify a schemaDoc field

- [minor] 7a4950bf:

  - Allow mutations: [{ schema: ..., resolver: ...}] to be specified in createList

## 2.0.0

- [minor] 5f891cff:

  - Add a setupHooks method to BaseFieldAdapter

- [minor] aca26f71:

  - Expose access to GraphQL query method within hooks

- [minor] 6471fc4a:

  - Add fieldAdaptersByPath object to field adapters

- [patch] 797dc862:

  - Move itemsQueryMeta onto the base adapter class

- [patch] 266b5733:

  - Don't try to resolve nested mutations which will be later backfilled

- [major] 48773907:

  - Move findFieldAdapterForQuerySegment onto the BaseListAdapter

- [minor] f37a8086:

  - Can now dump the GraphQL schema with keystone.dumpSchema(filePath)

- [patch] e6e3ea06:

  - Explicitly check whether field types are supported by the adapter

- [major] 860c3b80:

  - Add a postConnect method to list adapters to capture all the work which needs to be done after the database has been connected to

- Updated dependencies [723371a0]:
- Updated dependencies [53e27d75]:
- Updated dependencies [5f8043b5]:
- Updated dependencies [a3d5454d]:
  - @voussoir/access-control@0.4.1
  - @voussoir/fields@3.0.0
  - @voussoir/utils@1.0.0

## 1.1.0

- [patch] 8d8666ad:

  - Dependency upgrade: graphql -> 14.0.3, graphql-tools -> 4.0.3

- [minor] 6d8ce0fc:

  - Add createMany and updateMany mutations

## 1.0.0

- [patch] a95e0c69:

  - Report correct gqlName when reporting errors in deleteMutation

- [patch] 21626b66:

  - preSave/postRead item hooks run consistently

- [patch] 84b62eaa:

  - Decouple access of items in the database from operations of them provide room for pre/post hooks

- [patch] cd885800:

  - Update the field hooks API to use the officially sanctioned hook names.

- [patch] c6fff24c:

  - Call field hooks when deleting many items at once.

- [major] c83c9ed5:

  - Add Keystone.getAccessContext and remove List.getAccessControl, List.getFieldAccessControl, and Field.validateAccessControl.

- [patch] ffc98ac4:

  - Rename the access control function parameter `item` to `existingItem`

- [minor] c3ebd9e6:

  - Update resolver code to make all list access checks explicit

- [minor] ebae2d6f:

  - Minor tweaks to the graphQL schema behaviour

- [major] 78fd9555:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [patch] 3801e040:

  - Separate out the pre-hooks for resolving relationship fields from the field.resolveInput hooks

- [major] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- Updated dependencies [01718870]:
  - @voussoir/fields@2.0.0

## 0.7.0

- [patch] d1777cc1:

  - Consolidate logging and error handling mechanisms within core/List/index.js

- [minor] 45d4c379:

  - Update the functional API for Keystone List objects for consistency

- [patch] 9c383fe8:

  - Always use \$set and { new: true } in the mongoose adapter update() method

- Updated dependencies [3ae588b7]:
  - @voussoir/access-control@0.3.0
  - @voussoir/fields@1.4.0

## 0.6.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

## 0.5.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.4.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

## 0.3.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [minor] Support unique field constraint for mongoose adapter [750a83e](750a83e)
- [patch] Surface errors that occur at the adapter level during a create mutation. [81641b2](81641b2)
- [patch] Updated dependencies [445b699](445b699)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/fields@1.0.0
  - @voussoir/access-control@0.1.3
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)

# @keystonejs/core

# @keystone-alpha/core

## 2.0.4

- Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
  - @keystone-alpha/server@5.0.0

## 2.0.3

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [patch][78d25c40](https://github.com/keystonejs/keystone-5/commit/78d25c40):

  - Restructure internal code

- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
  - @keystone-alpha/server@4.0.0

## 2.0.2

- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
  - @keystone-alpha/server@3.0.0

## 2.0.1

- [patch][5ddb2ed6](https://github.com/keystonejs/keystone-5/commit/5ddb2ed6):

  - Always display clickable links when starting a server in dev mode

## 2.0.0

- [major][de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):

  - Update authStrategy APIs
    - Removes `authStrategy` from the `config` API of `Webserver`.
    - Removes `authStrategy` from the `serverConfig` of the core `keystone` system builder.
    - Removes the `setAuthStrategy` method from `AdminUI`.
    - Adds `authStrategy` to the `config` API of `AdminUI`.
    - `Webserver` checks `keystone.auth` to determine whether to set up auth session middlewares.

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/core

## 3.0.0

- [patch] 113e16d4:

  - Remove unused dependencies

- [major] 1db45262:

  - Use the `@voussoir/core` package as the entry point for custom servers.

    **Migration Guide**

      <!-- prettier-ignore -->

    1. Ensure your main entry point is `index.js`
    1. Add the new keystone module: `yarn add @voussoir/keystone`
    1. Remove the old keystone module: `yarn remove @voussoir/core`
    1. Update your imports:
       ```diff
       - const { Keystone } = require('@voussoir/core');
       + const { Keystone } = require('@voussoir/keystone');
       ```
    1. Update your `package.json` to start Keystone like so:
       ```json
       {
         "scripts": {
           "start": "keystone"
         }
       }
       ```
    1. Export your `keystone` and (optional) `admin` instances from `index.js`:
       ```javascript
       const keystone = new Keystone(/* .. */);
       const admin = new AdminUI(/* .. */);
       /* .. */
       module.exports = {
         keystone,
         admin,
       };
       ```
    1. Remove any usage of `@voussoir/server` / instantiations of `new WebServer()`
    1. If using an auth strategy, export it:
       ```javascript
       const authStrategy = keystone.createAuthStrategy(/* .. */);
       /* .. */
       module.exports = {
         keystone,
         admin,
         serverConfig: {
           authStrategy,
         },
       };
       ```
    1. If using any custom routes / modifying `server.app` in any way you'll need a
       _Custom Server_:

       1. Create a `server.js` along side your `index.js`
       1. Add the new core package: `yarn add @voussoir/core`
       1. Start with this boilerplate custom server in `server.js`:

          ```javascript
          const keystoneServer = require('@voussoir/core');

          keystoneServer
            .prepare({ port: 3000 })
            .then(({ server, keystone }) => {
              // [*] Custom routes get attached to `server.app` here.
              // If needed, you can access your Keystone instance via `keystone`.

              return server.start();
            })
            .then(({ port }) => {
              console.log(`Listening on port ${port}`);
            })
            .catch(error => {
              console.error(error);
            });
          ```

       1. Put your custom routes, etc, at the `[*]` marker in `server.js`.

    1. Run `yarn start`
