# @keystonejs/fields

## 5.0.2

### Patch Changes

- [`ebbcad70`](https://github.com/keystonejs/keystone/commit/ebbcad7042596a9c83c32c8e08dad50f9fcb59fd) [#1833](https://github.com/keystonejs/keystone/pull/1833) Thanks [@Vultraz](https://github.com/Vultraz)! - Added getFilename LocalFileAdapter config parameter to allow configuration of saved filename and saved original filename in database.

* [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f) [#1837](https://github.com/keystonejs/keystone/pull/1837) Thanks [@timleslie](https://github.com/timleslie)! - Updated mongo-related dependencies

* Updated dependencies [[`9f6bcddd`](https://github.com/keystonejs/keystone/commit/9f6bcddd84cc1d60f139ca116e9006258e417469), [`31b646ac`](https://github.com/keystonejs/keystone/commit/31b646ac3c06b82e809f5e55e8443ae5d21dac0f)]:
  - @keystonejs/adapter-mongoose@5.1.0
  - @keystonejs/utils@5.1.0
  - @keystonejs/adapter-knex@5.0.1
  - @keystonejs/test-utils@5.0.1

## 5.0.1

### Patch Changes

- [`209b7078`](https://github.com/keystonejs/keystone/commit/209b7078c7fa4f4d87568c58cb6cb6ad8162fe46) [#1817](https://github.com/keystonejs/keystone/pull/1817) Thanks [@Vultraz](https://github.com/Vultraz)! - Doc updates and minor functionality improvements for file field/adapters

- Updated dependencies [[`3c19cddd`](https://github.com/keystonejs/keystone/commit/3c19cddd0b8b8d1e17385a01a813a9e84ec14bb5)]:
  - @keystonejs/adapter-mongoose@5.0.1

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

### Patch Changes

- Updated dependencies [[`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310)]:
  - @keystonejs/access-control@5.0.0
  - @keystonejs/adapter-knex@5.0.0
  - @keystonejs/adapter-mongoose@5.0.0
  - @keystonejs/build-field-types@5.0.0
  - @keystonejs/field-content@5.0.0
  - @keystonejs/test-utils@5.0.0
  - @keystonejs/utils@5.0.0

# @keystone-alpha/fields

## 15.0.0

### Major Changes

- [`effc1f63`](https://github.com/keystonejs/keystone-5/commit/effc1f639d5824720b7a9d82c2ee881d77acb901) [#1789](https://github.com/keystonejs/keystone-5/pull/1789) Thanks [@timleslie](https://github.com/timleslie)! - `Relationship.convertResolvedOperationsToFieldValue()` has been removed.

### Patch Changes

- Updated dependencies [[`768420f5`](https://github.com/keystonejs/keystone-5/commit/768420f567c244d57a4e2a3aaafe628ea9813d9d)]:
  - @keystone-alpha/adapter-knex@6.0.2
  - @keystone-alpha/adapter-mongoose@6.0.1
  - @keystone-alpha/field-content@3.1.4

## 14.0.0

### Major Changes

- [`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9) [#1729](https://github.com/keystonejs/keystone-5/pull/1729) Thanks [@timleslie](https://github.com/timleslie)! - This change significantly changes how and when we populate `many`-relationships during queries and mutations.
  The behaviour of the GraphQL API has not changed, but queries should be more performant, particularly for items with many related items.
  The `existingItem` parameter in hooks will no longer have the `many`-relationship fields populated.
  `List.listQuery()` no longer populates `many` relationship fields.
  For most users there should not need to be any changes to code unless they are explicitly relying on a `many`-relationship field in a hook, in which case they will need to execute an explicit query to obtain the desired values.

### Patch Changes

- Updated dependencies [[`6d7d0df0`](https://github.com/keystonejs/keystone-5/commit/6d7d0df0515c3aa21c7d24db17919ddbb5701ce9)]:
  - @keystone-alpha/adapter-knex@6.0.0
  - @keystone-alpha/adapter-mongoose@6.0.0
  - @keystone-alpha/test-utils@2.6.3
  - @keystone-alpha/field-content@3.1.3

## 13.1.0

### Minor Changes

- [464d7579](https://github.com/keystonejs/keystone-5/commit/464d7579): Add Location field

### Patch Changes

- [3a52447d](https://github.com/keystonejs/keystone-5/commit/3a52447d): Ensure updateMutation() is always called with a string ID when resolving backlinks.

- Updated dependencies [6c4df466](https://github.com/keystonejs/keystone-5/commit/6c4df466):
- Updated dependencies [464d7579](https://github.com/keystonejs/keystone-5/commit/464d7579):
  - @keystone-alpha/test-utils@2.6.2
  - @keystone-alpha/adapter-knex@5.0.0
  - @arch-ui/day-picker@0.0.13
  - @arch-ui/select@0.1.0

## 13.0.0

### Major Changes

- [4e6a574d](https://github.com/keystonejs/keystone-5/commit/4e6a574d): MongoRelationshipInterface.getRelationshipQueryCondition() has been removed.

- Updated dependencies [b96a3a58](https://github.com/keystonejs/keystone-5/commit/b96a3a58):
  - @keystone-alpha/test-utils@2.6.1
  - @keystone-alpha/adapter-mongoose@5.0.0

## 12.3.0

### Minor Changes

- [552e6fb6](https://github.com/keystonejs/keystone-5/commit/552e6fb6): Add support for schema cache hints

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 12.2.1

### Patch Changes

- [04aa6a08](https://github.com/keystonejs/keystone-5/commit/04aa6a08): Fix regression when parent list of a Content field had a `where` clause as its access control.

## 12.2.0

### Minor Changes

- [ee000a7f](https://github.com/keystonejs/keystone-5/commit/ee000a7f): Added alpha channel support to the `Color` field. NOTE: This introduces a backwards-compatible change in the format saved to the database. The old format was a 6-character hex string preceded by a `#`, eg; `#663399`. The new format is an `rgba` string, eg; `rgba(102, 51, 153, 1)`. Both formats are fully supported in CSS, and the `Color` field will correctly handle old values stored in the hex format.

## 12.1.0

### Minor Changes

- [f56ffdfd](https://github.com/keystonejs/keystone-5/commit/f56ffdfd): Apply access control to auxiliary lists

## 12.0.0

### Major Changes

- [9ade2b2d](https://github.com/keystonejs/keystone-5/commit/9ade2b2d): Add support for `access: { auth: ... }` which controls whether authentication queries and mutations are accessible on a List

  If you have a `List` which is being used as the target of an Authentication Strategy, you should set `access: { auth: true }` on that list.

### Minor Changes

- [e5ad5ef1](https://github.com/keystonejs/keystone-5/commit/e5ad5ef1): Only generate relationship update types when needed

### Patch Changes

- [c681f476](https://github.com/keystonejs/keystone-5/commit/c681f476): Fix test flake

- Updated dependencies [7689753c](https://github.com/keystonejs/keystone-5/commit/7689753c):
  - @arch-ui/controls@0.0.10
  - @arch-ui/day-picker@0.0.12
  - @keystone-alpha/field-content@3.0.1
  - @arch-ui/filters@0.0.11
  - @arch-ui/input@0.1.0

## 11.0.0

### Major Changes

- [89c0d7e9](https://github.com/keystonejs/keystone-5/commit/89c0d7e9): The `.access` property of Fields is now keyed by `schemaName`. As such, a number of getters have been replaced with methods which take `{ schemaName }`.

  - `get gqlOutputFields()` -> `gqlOutputFields({ schemaName })`
  - `get gqlOutputFieldResolvers()` -> `gqlOutputFieldResolvers({ schemaName })`
  - `get gqlAuxFieldResolvers() -> gqlAuxFieldResolvers({ schemaName })`
  - `get gqlAuxQueryResolvers()` -> `gqlAuxQueryResolvers({ schemaName })`
  - `get gqlAuxMutationResolvers()` -> `gqlAuxMutationResolvers({ schemaName })`
  - `get gqlQueryInputFields()` -> `gqlQueryInputFields({ schemaName })`

- [a8e9378d](https://github.com/keystonejs/keystone-5/commit/a8e9378d): `Keystone`, `List` and `Field` constructors now take `schemaNames` as config options. A number of methods also now take `schemaName` parameters.
  - `keystone.getTypeDefs()` -> `keystone.getTypeDefs({ schemaName })`
  - `keystone.getAdminSchema()` -> `keystone.getAdminSchema({ schemaName })`
  - `keystone.dumpSchema(file)` -> `keystone.dumpSchema(file, schemaName)`
  - `keystone.getAdminMeta()` -> `keystone.getAdminMeta({ schemaName })`
  - `list.getAdminMeta()` -> `list.getAdminMeta({ schemaName })`
  - `field.getAdminMeta()` -> `field.getAdminMeta({ schemaName })`

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

## 10.7.2

### Patch Changes

- [99dc6cae](https://github.com/keystonejs/keystone-5/commit/99dc6cae): Revert usage of Apollo Hooks

## 10.7.1

### Patch Changes

- [d9bd327e](https://github.com/keystonejs/keystone-5/commit/d9bd327e): Embed fields should handle receiving null or '' when being unset

## 10.7.0

### Minor Changes

- [79e362c0](https://github.com/keystonejs/keystone-5/commit/79e362c0): upgrade react-apollo and use hooks instead of Query and Mutation components

## 10.6.2

### Patch Changes

- [4ab3cc38](https://github.com/keystonejs/keystone-5/commit/4ab3cc38): OEmbed & Unsplash types no longer lose their value on update.

## 10.6.1

### Patch Changes

- [9c1b1886](https://github.com/keystonejs/keystone-5/commit/9c1b1886): CloudinaryImage & File fields no longer lose their value during update mutations

## 10.6.0

### Minor Changes

- [f7ba8a35](https://github.com/keystonejs/keystone-5/commit/f7ba8a35): Prefill nested creates for Relationship fields with back referennces

## 10.5.0

### Minor Changes

- [33ed590e](https://github.com/keystonejs/keystone-5/commit/33ed590e): Respect static field-level access control in the Admin UI

## 10.4.0

### Minor Changes

- [da65e1a0](https://github.com/keystonejs/keystone-5/commit/da65e1a0): Allow display and filtering of 'Id' column in Admin UI

## 10.3.0

### Minor Changes

- [a640471a](https://github.com/keystonejs/keystone-5/commit/a640471a): - Add `Slug.alwaysMakeUnique` option to force calling `makeUnique` even when initially generated slug may already be unique to prevent accidental data leak.
  - Fix a bug where items restricted via access control weren't considered when testing a `Slug` for uniqueness.

## 10.2.0

### Minor Changes

- [e049cfcb](https://github.com/keystonejs/keystone-5/commit/e049cfcb): Support defaultValue as a function at mutation execution time
- [e049cfcb](https://github.com/keystonejs/keystone-5/commit/e049cfcb): Support defaultValue as a function in view Controllers

### Patch Changes

- [fc437e06](https://github.com/keystonejs/keystone-5/commit/fc437e06): Blocks correctly handle case when no mutations are present for their block in a Content field.
- [957a40d9](https://github.com/keystonejs/keystone-5/commit/957a40d9): Upgrade react-select

- Updated dependencies [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86):
- Updated dependencies [fc437e06](https://github.com/keystonejs/keystone-5/commit/fc437e06):
  - @keystone-alpha/test-utils@2.2.1
  - @keystone-alpha/adapter-knex@4.0.0
  - @keystone-alpha/adapter-mongoose@4.0.0
  - @arch-ui/drawer@0.0.10

## 10.1.0

### Minor Changes

- [d7819a55](https://github.com/keystonejs/keystone-5/commit/d7819a55): Add a Slug field type for auto-generating slugs based on other fields.

### Patch Changes

- [653aa0e2](https://github.com/keystonejs/keystone-5/commit/653aa0e2): Remove incorrect Cell view config from Slug field
- [9c3b7436](https://github.com/keystonejs/keystone-5/commit/9c3b7436): Ensure searchUnsplash mutation returns results with a non-null id

## 10.0.0

### Major Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Switching lists to use standard field types for primary keys (instead of weird pseudo-field)

### Minor Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Adding `precision` and `scale` as `knexOptions` for the `Decimal` field type
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Adding isIndexed field config and support for in most field types
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Check for the number type in label resolver to prevent false positive on zero.

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade emotion to 10.0.14
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade prettier to 1.18.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Fixing issue with the Select fields on Knex; options not being applied correctly
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade to mongoose 5.6.5
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Fixing application of some field config on knex
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade graphql to 14.4.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Ensure the CloudinaryImage Content Block correctly updates the nested Slate.js image Node data instead of overwiting it which could cause issues for the image renderer expecting an Immutable Map, but receiving a plain Object.

## 9.1.0

### Minor Changes

- [18064167](https://github.com/keystonejs/keystone-5/commit/18064167):

  Adding `knexOptions` to the KnexFieldAdapter to support DB-level config for nullability (`isNotNullable`) and defaults (`defaultTo`)

### Patch Changes

- [4007f5dd](https://github.com/keystonejs/keystone-5/commit/4007f5dd):

  Adding field instance to the BaseFieldAdapter constructor arguments

## 9.0.0

### Major Changes

- [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):

  Refactoring the knex adapter (and field adapters) to give the field type more control of the table schema (add 0 or multiple columns, etc)

## 8.1.0

### Minor Changes

- [e945926c](https://github.com/keystonejs/keystone-5/commit/e945926c):

  Adding Uuid field type with Mongoose and Knex adapters

### Patch Changes

- [ac7934fe](https://github.com/keystonejs/keystone-5/commit/ac7934fe):

  CloudinaryImage, Unsplash, and OEmbed blocks will correctly re-connect to existing block data if present rather than disconnecting and reconnecting on every save of the Content editor.

* Updated dependencies [ac7934fe](https://github.com/keystonejs/keystone-5/commit/ac7934fe):
  - @keystone-alpha/field-content@2.0.0

## 8.0.0

### Major Changes

- [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):

  Extract `Content` field into its own package: `@keystone-alpha/field-content`.

### Patch Changes

- [98bef287](https://github.com/keystonejs/keystone-5/commit/98bef287):

  Fix the Relationship field type not allowing relationships to be removed from the Admin UI

## 7.2.0

### Minor Changes

- [c5c46545](https://github.com/keystonejs/keystone-5/commit/c5c46545):

  Add `searchUnsplash` GraphQL query when using the `Unsplash` field type

### Patch Changes

- [148400dc](https://github.com/keystonejs/keystone-5/commit/148400dc):

  Using `connect: []` and `create: []` in many-relationship queries now behaves as expected.

* [384135b1](https://github.com/keystonejs/keystone-5/commit/384135b1):

  Minor bump of bcrypt version

## 7.1.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Add oEmbed Content Block with adapter-specific renderers.

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Add an Unsplash Image type which fetches data from the Unsplash API

- [8799190e](https://github.com/keystonejs/keystone-5/commit/8799190e):

  Expose `options.adminMeta` to Content Blocks.

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  Add an Unsplash Image Block for the Content field which takes an Unsplash Image ID and displays the image within the Content field.

### Patch Changes

- [8799190e](https://github.com/keystonejs/keystone-5/commit/8799190e):

  Correctly use `options.adminMeta.readViews()` to load OEmbed Block views.

* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
* Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @arch-ui/fields@2.0.0
  - @arch-ui/controls@0.0.8
  - @arch-ui/day-picker@0.0.9
  - @arch-ui/filters@0.0.9
  - @arch-ui/input@0.0.8

## 7.0.1

### Patch Changes

- [c3daef1a](https://github.com/keystonejs/keystone-5/commit/c3daef1a):

  Correctly guard against undefined serverErrors in RelationshipSelect

## 7.0.0

### Major Changes

- [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):

  - Expose a new method on field Controllers: `field#validateInput()`.
    - ```javascript
      /**
       * Perform client-side data validations before performing a
       * mutation. Any errors or warnings raised will abort the mutation and
       * re-render the `Field` view with a new `error` prop.
       *
       * This method is only called on fields whos `.hasChanged()` property returns
       * truthy.
       *
       * If only warnings are raised, the Admin UI will allow the user to confirm
       * they wish to continue anyway. If they continue, and no values have changed
       * since the last validation, validateInput will be called again, however any
       * warnings raised will be ignored and the mutation will proceed as normal.
       * This method is called after `serialize`.
       *
       * @param {Object} options
       * @param {Object} options.resolvedData The data object that would be sent to
       * the server. This data has previously been fed through .serialize()
       * @param {Object} options.originalInput The data as set by the `Field`
       * component. This data has _not_ been previously fed through .serialize().
       * @param {addFieldWarningOrError} options.addFieldValidationError
       * @param {addFieldWarningOrError} options.addFieldValidationWarning
       * @return undefined
       */
      validateInput = ({
        resolvedData,
        originalInput,
        addFieldValidationError,
        addFieldValidationWarning,
      }) => {
        // Call addFieldValidationError / addFieldValidationWarning here
      };
      ```
  - `Password` field is now using `validateInput()` which enforces `isRequired`
    and `minLength` checks in the Admin UI.

### Minor Changes

- [5c28c142](https://github.com/keystonejs/keystone-5/commit/5c28c142):

  - Add `OEmbed` field

    ```javascript
    const { Keystone } = require('@keystone-alpha/keystone');
    const { OEmbed } = require('@keystone-alpha/fields');
    const { IframelyOEmbedAdapter } = require('@keystone-alpha/oembed-adapters');

    const keystone = new Keystone(/* ... */);

    const iframelyAdapter = new IframelyOEmbedAdapter({
      apiKey: '...', // Get one from https://iframely.com
    });

    keystone.createList('User', {
      fields: {
        portfolio: {
          type: OEmbed,
          adapter: iframelyAdapter,
        },
      },
    });
    ```

### Patch Changes

- [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):

  - Correctly read auth strategy info for displaying the "setCurrentUser" toggle on Relationship fields in the Admin UI

- [3958a9c7](https://github.com/keystonejs/keystone-5/commit/3958a9c7):

  Fields configured with isRequired now behave as expected on create and update, returning a validation error if they are null.

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [16befb6a](https://github.com/keystonejs/keystone-5/commit/16befb6a):
  - @arch-ui/fields@1.0.0

## 6.2.2

### Patch Changes

- [25f9ad7e](https://github.com/keystonejs/keystone-5/commit/25f9ad7e):

  Compile Controller base class to ES5 so that non-native classes can extend it

## 6.2.1

### Patch Changes

- [07692ee7](https://github.com/keystonejs/keystone-5/commit/07692ee7):

  Fix item details updating failures when Access Control enabled on a field, but that field is not edited (ie; we were sending unedited data to the mutation which would (correctly) fail).

## 6.2.0

### Minor Changes

- [c5a1d301](https://github.com/keystonejs/keystone-5/commit/c5a1d301):

  - CloudinaryImage single image block correctly loads and displays saved image
  - AdminUI deserialises fields JIT before rendering

## 6.1.1

### Patch Changes

- [d580c298](https://github.com/keystonejs/keystone-5/commit/d580c298):

  Minor Admin UI Tweaks

* Updated dependencies [71766bd8](https://github.com/keystonejs/keystone-5/commit/71766bd8):
* Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone-5/commit/9a0456ff):
  - @arch-ui/day-picker@0.0.7
  - @keystone-alpha/test-utils@2.0.2
  - @keystone-alpha/adapter-mongoose@2.0.0

## 6.1.0

### Minor Changes

- [29728d5e](https://github.com/keystonejs/keystone-5/commit/29728d5e):

  Allow blocks to pick data sent to the adminUI via extendAdminMeta()

### Patch Changes

- [e502af66](https://github.com/keystonejs/keystone-5/commit/e502af66):

  Fix dist directories not being cleared before builds causing broken builds with build-field-types

## 6.0.0

### Major Changes

- [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):

  Explicit field config options are no longer available on `field.config` for field Implementaiton objects.

- [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):

  - Field view Controllers: Rename `.getValue()` to `.serialize()` and add `.deserialize()` to enable handling pre-save to server & post-read from server respectively.

- [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):

  - Use build-field-types

- [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):

  - `{ mongooseOptions: { isRequired: true } }` should be replaced by `{ isRequired: true }`

- [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):

  - Field view Controllers: Rename `.getIntialData()` to `.getDefaultValue()` to better reflect the purpose of the function.

### Minor Changes

- [81b481d0](https://github.com/keystonejs/keystone-5/commit/81b481d0):

  - Added support for isMultiline to Text field type

- [c9102446](https://github.com/keystonejs/keystone-5/commit/c9102446):

  - Add a mechanism for loading multiple Suspense-aware components in parallel

### Patch Changes

- [ebb858a5](https://github.com/keystonejs/keystone-5/commit/ebb858a5):

  - Optimistically open Nested Create Item Modal and show loading spinner

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

- [a4c66012](https://github.com/keystonejs/keystone-5/commit/a4c66012):

  - Use `.path` rather than `.config.path` in Controllers

- [3aeabc5e](https://github.com/keystonejs/keystone-5/commit/3aeabc5e):

  - Refactor Content Type to extend Relationship Type to simplify implementation and enable future enhancements

- [b8fc0a22](https://github.com/keystonejs/keystone-5/commit/b8fc0a22):

  - Update dependency

* Updated dependencies [e6e95173](https://github.com/keystonejs/keystone-5/commit/e6e95173):
* Updated dependencies [a03fd601](https://github.com/keystonejs/keystone-5/commit/a03fd601):
* Updated dependencies [5f1a5cf3](https://github.com/keystonejs/keystone-5/commit/5f1a5cf3):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
* Updated dependencies [5f1a5cf3](https://github.com/keystonejs/keystone-5/commit/5f1a5cf3):
  - @keystone-alpha/build-field-types@1.0.0
  - @arch-ui/drawer@0.0.6
  - @arch-ui/tooltip@0.0.6
  - @arch-ui/popout@0.0.6
  - @keystone-alpha/access-control@1.0.4
  - @keystone-alpha/adapter-knex@1.0.7
  - @keystone-alpha/adapter-mongoose@1.0.7
  - @keystone-alpha/utils@3.0.0

## 5.0.0

- [patch][5c36ea0b](https://github.com/keystonejs/keystone-5/commit/5c36ea0b):

  - Content Field no longer throws when no blocks specified or server data is corrupt

- [patch][ec76b500](https://github.com/keystonejs/keystone-5/commit/ec76b500):

  - Initialise Block Constructors inside Field Controller

- [major][ec76b500](https://github.com/keystonejs/keystone-5/commit/ec76b500):

  - Rename Content Editor field to document for slate.js consistency

- [major][85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):

  - Expose result of running relationship operations (create/connect/disconnect)

- [patch][e75c105c](https://github.com/keystonejs/keystone-5/commit/e75c105c):

  - admin revamp

- [patch][d145fcb9](https://github.com/keystonejs/keystone-5/commit/d145fcb9):

  - Correctly return null to the Admin UI for to-single relationship fields which don't have any ID set

- [patch][ec76b500](https://github.com/keystonejs/keystone-5/commit/ec76b500):

  - Ensure Content Block views are always loaded even when not imported

## 4.0.0

- [patch][7b8d254d](https://github.com/keystonejs/keystone-5/commit/7b8d254d):

  - Update external dependencies

- [major][37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):

  - Generate cjs and esm bundlers for Controller file

- [patch][302930a4](https://github.com/keystonejs/keystone-5/commit/302930a4):

  - Minor internal code cleanups

- [patch][21be780b](https://github.com/keystonejs/keystone-5/commit/21be780b):

  - Use updated test-utils APIs

- Updated dependencies [545c9464](https://github.com/keystonejs/keystone-5/commit/545c9464):
- Updated dependencies [24bed583](https://github.com/keystonejs/keystone-5/commit/24bed583):
- Updated dependencies [21be780b](https://github.com/keystonejs/keystone-5/commit/21be780b):
  - @arch-ui/drawer@0.0.4
  - @arch-ui/button@0.0.4
  - @keystone-alpha/test-utils@2.0.0

## 3.0.2

- [patch][03ea2b1d](https://github.com/keystonejs/keystone-5/commit/03ea2b1d):

  - Bump version of @arch-ui/layout

## 3.0.1

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):
  - @keystone-alpha/access-control@1.0.2
  - @keystone-alpha/adapter-knex@1.0.3
  - @keystone-alpha/adapter-mongoose@1.0.3
  - @keystone-alpha/utils@2.0.0

## 3.0.0

- [patch][39067f44](https://github.com/keystonejs/keystone-5/commit/39067f44):

  - Add text date and time pickers

- [major][9a9f214a](https://github.com/keystonejs/keystone-5/commit/9a9f214a):

  - Build field type views before publishing to npm and stop running Babel on Keystone packages in node_modules in the Admin UI

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

- Updated dependencies [96015257](https://github.com/keystonejs/keystone-5/commit/96015257):
  - @arch-ui/day-picker@0.0.3

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

  - Add README.md to package

- [patch][c0e64c01](https://github.com/keystonejs/keystone-5/commit/c0e64c01):

  - Move system tests into api-tests package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/fields

## 3.1.0

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [minor] eaab547c:

  - Allow adding related items from the Relationship field

- [patch] b155d942:

  - Update mongo/mongoose dependencies

- [patch] d035c199:

  - Re-enable check for bcrypt regex in <password>\_is_set

- Updated dependencies [23c3fee5]:
  - @arch-ui/button@0.0.2
  - @arch-ui/controls@0.0.2
  - @arch-ui/day-picker@0.0.2
  - @arch-ui/drawer@0.0.2
  - @arch-ui/fields@0.0.2
  - @arch-ui/filters@0.0.2
  - @arch-ui/icons@0.0.2
  - @arch-ui/input@0.0.2
  - @arch-ui/layout@0.0.2
  - @arch-ui/lozenge@0.0.2
  - @arch-ui/options@0.0.2
  - @arch-ui/popout@0.0.2
  - @arch-ui/select@0.0.2
  - @arch-ui/theme@0.0.2
  - @arch-ui/tooltip@0.0.2
  - @arch-ui/typography@0.0.2

## 3.0.0

- [patch] 513c7b63:

  - Rename MongoSelectInterface to MongoRelationshipInterface in the relationship field type

- [minor] 5f891cff:

  - Add a setupHooks method to BaseFieldAdapter

- [patch] 723371a0:

  - Correctly surface nested errors from GraphQL

- [major] 53e27d75:

  - Removes methods from Mongoose adapter classes: getFieldAdapterByQueryConditionKey, getSimpleQueryConditions, getRelationshipQueryConditions, getQueryConditions, getRelationshipQueryConditions, getRefListAdapter, hasQueryCondition.

- [minor] 4faf5cfd:

  - Add withMeta flag to Relationship field for disabling meta queries

- [patch] 306f0b7e:

  - Remove recalcHeight prop from Filter props

- [patch] 266b5733:

  - Don't try to resolve nested mutations which will be later backfilled

- [minor] dc53492c:

  - Add support for the Knex adapter

- [patch] 7ce811ab:

  - Converts mongoose ObjectIds to string in File field types

- [major] 5f8043b5:

  - Simplify Field component api
    - Replace item prop with value prop which is equal to item[field.path]
    - Replace itemErrors prop with error prop which is equal to itemErrors[field.path]
    - Change onChange prop so that it only accepts the value rather than the field and the value
    - Remove initialData prop which wasn't used in a Field component and was only pass to the Field components in one the places where the Field component is used

- [minor] f37a8086:

  - Can now dump the GraphQL schema with keystone.dumpSchema(filePath)

- [patch] 9f2ee393:

  - Add adapter parameter to setupServer() and add multiAdapterRunners()

- [patch] 860c3b80:

  - Add a postConnect method to list adapters to capture all the work which needs to be done after the database has been connected to

- Updated dependencies [aca26f71]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [48773907]:
- Updated dependencies [a3d5454d]:
  - @voussoir/access-control@0.4.1
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/test-utils@1.0.0
  - @voussoir/utils@1.0.0
  - @voussoir/adapter-knex@0.0.2

## 2.0.1

- [patch] 3aede2f5:

  - Make relationship select work for large lists

- [patch] c3dd4295:

  - Don't clobber DateTime fields during update mutation

- [patch] 8d8666ad:

  - Dependency upgrade: graphql -> 14.0.3, graphql-tools -> 4.0.3

## 2.0.0

- [patch] 21626b66:

  - preSave/postRead item hooks run consistently

- [patch] 8145619f:

  - update to selecting and managing items in the list view

- [minor] cd885800:

  - Update the field hooks API to use the officially sanctioned hook names.

- [major] c83c9ed5:

  - Add Keystone.getAccessContext and remove List.getAccessControl, List.getFieldAccessControl, and Field.validateAccessControl.

- [patch] c3ebd9e6:

  - Update resolver code to make all list access checks explicit

- [patch] 8ab899dd:

  - Internal refactor of nested mutation handling for relationships

- [patch] 929b177c:

  - Enable sorting on DateTime fields

- [minor] 33843c9e:

  - Update the backlink queue API

- [major] 01718870:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [minor] 3801e040:

  - Separate out the pre-hooks for resolving relationship fields from the field.resolveInput hooks

- [patch] 023a5c72:

  - Enable setting DateTime to null

- [patch] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- [patch] 8fc0abb3:

  - Make DayPicker scrollable

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [ffc98ac4]:
  - @voussoir/access-control@0.4.0

## 1.4.0

- [minor] 3ae588b7:

  - Rename test*AccessControl functions to validate*AccessControl

- [patch] ff4b98c5:

  - Consolidate mongoose schema pre/post hooks for field types

- [patch] 45d4c379:

  - Update the functional API for Keystone List objects for consistency

- [minor] 589dbc02:

  - navigation improvements and paper cut fixes

- [minor] b0d19c24:

  - Use consistent query condition builders across all field types

- Updated dependencies [9c383fe8]:
  - @voussoir/adapter-mongoose@0.5.0
  - @voussoir/test-utils@0.1.2

## 1.3.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

- Updated dependencies [1d30a329"
  ]:
  - @voussoir/ui@0.4.0

## 1.2.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 1.1.0

- [minor] d94b517:

  Add \_ksListsMeta query to gather type and relationship information

- [minor] a3b995c:

  Add \_ksListsMeta query to gather type and relationship information

- [patch] ca7ce46:

  Correctly hide fields from Relationships when not readable

## 1.0.1

- [patch] Avoid recreating indexes on every app boot (https://github.com/keystonejs/keystone-5/pull/459) [b84dd80](b84dd80)

## 1.0.0

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [major] `Text` fields now default to case sensitive filtering. Insensitive filters available via the `_i` suffix (eg. `name: "Jane"` -vs- `name_i: "jane"`). This replaces the `${path}_case_sensitive` boolean that could previously be specified when using `Text` field filters. This is all covered in more detail in #359. [445b699](445b699)
- [minor] Support unique field constraint for mongoose adapter [750a83e](750a83e)
- [patch] Updated dependencies [9c75136](9c75136)
  - @voussoir/access-control@0.1.3
  - @voussoir/adapter-mongoose@0.3.0
  - @voussoir/utils@0.2.0

## 0.2.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
