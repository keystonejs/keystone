# @keystonejs/app-admin-ui

## 5.7.2

### Patch Changes

- [`8552314d`](https://github.com/keystonejs/keystone/commit/8552314d9f509010c462df6e64fe23839fbea5e3) [#2330](https://github.com/keystonejs/keystone/pull/2330) - Removed the preconstruct step that was causing issues outside the momorepo.
- Updated dependencies [[`8552314d`](https://github.com/keystonejs/keystone/commit/8552314d9f509010c462df6e64fe23839fbea5e3)]:
  - @keystonejs/fields@6.2.2

## 5.7.1

### Patch Changes

- [`ce8c9843`](https://github.com/keystonejs/keystone/commit/ce8c9843f2d542e4916d68b98f23abe85c5b1bb5) [#2310](https://github.com/keystonejs/keystone/pull/2310) - Added missing dependency.

## 5.7.0

### Minor Changes

- [`6bc87d43`](https://github.com/keystonejs/keystone/commit/6bc87d43de4861068de257735c1a6cf886cd3c17) [#2279](https://github.com/keystonejs/keystone/pull/2279) - Added React hooks to the AdminUI.

  This PR changes the way the `<CreateItem/>` component works internally. It also paves the way for future AdminUI extensions by exporting front-end components and utilities from `@keystonejs/app-admin-ui/components`. Initially this includes a `<ListProvider/>` component that is currently being consumed by the relationship field.

### Patch Changes

- Updated dependencies [[`6bc87d43`](https://github.com/keystonejs/keystone/commit/6bc87d43de4861068de257735c1a6cf886cd3c17), [`6eb23086`](https://github.com/keystonejs/keystone/commit/6eb23086485d9bcbb93e35ec716d846790d611f2), [`ca2b043a`](https://github.com/keystonejs/keystone/commit/ca2b043a5043f6b4b110050127b2a9d759bb8569), [`8f54a4eb`](https://github.com/keystonejs/keystone/commit/8f54a4eb2d63ed042d736fd20ab622f326e111b8)]:
  - @keystonejs/fields@6.2.0
  - @arch-ui/fields@2.1.0

## 5.6.0

### Minor Changes

- [`56bb67fd`](https://github.com/keystonejs/keystone/commit/56bb67fdf794af56cb4167705d5693e0e4903a49) [#2264](https://github.com/keystonejs/keystone/pull/2264) - Fixed a bug where the search input on the List page would gain focus when the user pressed SHIFT

### Patch Changes

- [`87a17087`](https://github.com/keystonejs/keystone/commit/87a170877d9f735d909ee91b7661fa4a10b56a59) [#2087](https://github.com/keystonejs/keystone/pull/2087) - Show a more helpful error in the AdminUI when the list page overflows the available number of items.

## 5.5.4

### Patch Changes

- [`709d44a3`](https://github.com/keystonejs/keystone/commit/709d44a352f4e63be911a699c73304e830e2ee23) [#2198](https://github.com/keystonejs/keystone/pull/2198) - Small UX updates to item/list search input

* [`6371b021`](https://github.com/keystonejs/keystone/commit/6371b021ee0b2022a3724992a6319bd0d7dd3583) [#2151](https://github.com/keystonejs/keystone/pull/2151) - Correctly load Content field views when field access set to update: false
* Updated dependencies [[`220d3a4b`](https://github.com/keystonejs/keystone/commit/220d3a4bc4265dc56653bed4b292f3e4d708502b), [`11586035`](https://github.com/keystonejs/keystone/commit/115860350aa901749d240cb275cada29b8d541f8)]:
  - @keystonejs/fields@6.1.0

## 5.5.3

### Patch Changes

- [`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a) [#2144](https://github.com/keystonejs/keystone/pull/2144) - Upgraded all @babel/\* dependencies.
- Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a), [`f3ea15f8`](https://github.com/keystonejs/keystone/commit/f3ea15f86f7bbd08abddcf3a63c5c66e86693d29), [`ef419b59`](https://github.com/keystonejs/keystone/commit/ef419b59729a050f25fc886be6ec8ce17cbb1104)]:
  - @arch-ui/badge@0.0.11
  - @arch-ui/button@0.0.13
  - @arch-ui/card@0.0.9
  - @arch-ui/confirm@0.0.13
  - @arch-ui/controls@0.1.3
  - @arch-ui/dialog@0.0.14
  - @arch-ui/drawer@0.0.15
  - @arch-ui/dropdown@0.0.12
  - @arch-ui/fields@2.0.5
  - @arch-ui/hooks@0.0.7
  - @arch-ui/icons@0.0.8
  - @arch-ui/input@0.1.4
  - @arch-ui/layout@0.2.8
  - @arch-ui/loading@0.0.12
  - @arch-ui/lozenge@0.0.11
  - @arch-ui/navbar@0.1.5
  - @arch-ui/options@0.0.13
  - @arch-ui/pagination@0.0.13
  - @arch-ui/pill@0.1.10
  - @arch-ui/popout@0.0.13
  - @arch-ui/select@0.1.3
  - @arch-ui/theme@0.0.7
  - @arch-ui/tooltip@0.1.6
  - @arch-ui/typography@0.0.12
  - @keystonejs/build-field-types@5.1.4
  - @keystonejs/fields@6.0.5
  - @keystonejs/utils@5.1.3
  - @arch-ui/alert@0.0.12
  - @arch-ui/common@0.0.8

## 5.5.2

### Patch Changes

- [`6f1430e4`](https://github.com/keystonejs/keystone/commit/6f1430e4b14d173d574e54e5c78ff1477528a2a6) [#2135](https://github.com/keystonejs/keystone/pull/2135) - Correctly capture suspended components in Details View in Admin UI

## 5.5.1

### Patch Changes

- Updated dependencies [[`3d2c4b3f`](https://github.com/keystonejs/keystone/commit/3d2c4b3fb8f05e79fc1a4a8e39077058466795a2), [`ed85a3d3`](https://github.com/keystonejs/keystone/commit/ed85a3d3776873893e9ba46f3b0c4d0f71bd6b6d)]:
  - @keystonejs/utils@5.1.2
  - @arch-ui/confirm@0.0.12
  - @arch-ui/dialog@0.0.13
  - @arch-ui/drawer@0.0.14
  - @arch-ui/popout@0.0.12
  - @keystonejs/fields@6.0.3

## 5.5.0

### Minor Changes

- [`045af44`](https://github.com/keystonejs/keystone/commit/045af44b1a9fa186dbc04c1d05b07a13ba58e3b0) [#2106](https://github.com/keystonejs/keystone/pull/2106) - Improved toast messaging when creating and updating items

## 5.4.1

### Patch Changes

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Fixed an issue where creating a new item would throw an would appear: `Cannot read property 'refetch' of undefined`

* [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Upgrade all Babel deps to the same version (7.7.4)

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Upgrade react-transition-group to 4.3.0
- Updated dependencies [[`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62), [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62)]:
  - @keystonejs/fields@6.0.2
  - @arch-ui/badge@0.0.10
  - @arch-ui/button@0.0.12
  - @arch-ui/card@0.0.8
  - @arch-ui/confirm@0.0.11
  - @arch-ui/controls@0.1.2
  - @arch-ui/dialog@0.0.12
  - @arch-ui/drawer@0.0.13
  - @arch-ui/dropdown@0.0.11
  - @arch-ui/fields@2.0.4
  - @arch-ui/hooks@0.0.6
  - @arch-ui/icons@0.0.7
  - @arch-ui/input@0.1.3
  - @arch-ui/layout@0.2.7
  - @arch-ui/loading@0.0.11
  - @arch-ui/lozenge@0.0.10
  - @arch-ui/navbar@0.1.4
  - @arch-ui/options@0.0.12
  - @arch-ui/pagination@0.0.12
  - @arch-ui/pill@0.1.9
  - @arch-ui/popout@0.0.11
  - @arch-ui/select@0.1.2
  - @arch-ui/theme@0.0.6
  - @arch-ui/tooltip@0.1.5
  - @arch-ui/typography@0.0.11
  - @keystonejs/build-field-types@5.1.3
  - @keystonejs/utils@5.1.1
  - @arch-ui/alert@0.0.11
  - @arch-ui/common@0.0.7

## 5.4.0

### Minor Changes

- [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290) [#2078](https://github.com/keystonejs/keystone/pull/2078) - Converted remaining uses of Apollo components in Admin UI to hooks.

* [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290) [#2078](https://github.com/keystonejs/keystone/pull/2078) - Refactored out session provider from Admin UI and switched to individual Apollo packages as appropriate. Without the session provider, the Admin UI no longer needs the full react-apollo package.

### Patch Changes

- [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290) [#2078](https://github.com/keystonejs/keystone/pull/2078) - Removed an unused react-node-resolver dependency.
- Updated dependencies [[`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290), [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290), [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290)]:
  - @keystonejs/fields@6.0.1
  - @arch-ui/alert@0.0.10

## 5.3.0

### Minor Changes

- [`733ac847`](https://github.com/keystonejs/keystone/commit/733ac847cab488dc92a30e7b458191d750fd5a3d) [#1983](https://github.com/keystonejs/keystone/pull/1983) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Fixed a bug with schema generation and display in the AdminUI when a list contains only fields where access control is false.

* [`2cc83b12`](https://github.com/keystonejs/keystone/commit/2cc83b12be757019ba25658139478e8f5b2b19c6) [#1988](https://github.com/keystonejs/keystone/pull/1988) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added an `isOrderable` option to field implementation that controls whether the field is sortable in the AdminUI. Defaults to false and is set to true by sortable field types.

  The `parseFieldAccess` method can now also be overwritten in the field implementation class.

* [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64) [#1978](https://github.com/keystonejs/keystone/pull/1978) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added a new field type `Virtual`. This allows creation of fields that return data computed from other field values or outside Keystone.

### Patch Changes

- [`5b81152d`](https://github.com/keystonejs/keystone/commit/5b81152d72b16bcfa2ef16620721b059cb225d05) [#2059](https://github.com/keystonejs/keystone/pull/2059) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed `react-document-title` dependency.

* [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866) [#1995](https://github.com/keystonejs/keystone/pull/1995) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `react` and `react-dom` to 16.12.0.

- [`640cbd95`](https://github.com/keystonejs/keystone/commit/640cbd9556cb8848fdfbe9689ac4aadd1be29fba) [#1997](https://github.com/keystonejs/keystone/pull/1997) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated logo on signin and signout pages.

* [`1ad222ed`](https://github.com/keystonejs/keystone/commit/1ad222ed27b2f261f8fda8eb819027553ecd0cd2) [#2023](https://github.com/keystonejs/keystone/pull/2023) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed letters being cut off in Admin UI cards.

- [`fb0c8331`](https://github.com/keystonejs/keystone/commit/fb0c83316c1f3e6796a24480d3cfc8055355a7fc) [#2040](https://github.com/keystonejs/keystone/pull/2040) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Fixed a bug on saving lists with virtual fields.

* [`945ff089`](https://github.com/keystonejs/keystone/commit/945ff089a60e5a1e1a8cdceb8df1b04f8d6263f4) [#2024](https://github.com/keystonejs/keystone/pull/2024) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed `signOut` codepath being called multiple times in succession.
* Updated dependencies [[`267dab2f`](https://github.com/keystonejs/keystone/commit/267dab2fee5bbea711c417c13366862e8e0ab3be), [`8188d76c`](https://github.com/keystonejs/keystone/commit/8188d76cb3f5d3e112ef95fd4e1887db9a520d9d), [`af1e9e4d`](https://github.com/keystonejs/keystone/commit/af1e9e4d3b74753b903b20641b51df99184793df), [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866), [`7c46673b`](https://github.com/keystonejs/keystone/commit/7c46673b927b08f3f7628ae2557156262f2e1049), [`ee6fbcb2`](https://github.com/keystonejs/keystone/commit/ee6fbcb264a640f58332c50a2f502a4380c0d071), [`2a52b3ce`](https://github.com/keystonejs/keystone/commit/2a52b3ce48e0df9589f4958c4d79e2b19aa1c134), [`0145f7e2`](https://github.com/keystonejs/keystone/commit/0145f7e21d9297e3037c709587eb3b4220ba3f01), [`95372949`](https://github.com/keystonejs/keystone/commit/953729498fd0c7f68c82f6d4e438808777887d36), [`2cc83b12`](https://github.com/keystonejs/keystone/commit/2cc83b12be757019ba25658139478e8f5b2b19c6), [`a1dcbd7b`](https://github.com/keystonejs/keystone/commit/a1dcbd7bd7448fdcacbfe9fb0196bfee3c4a5326), [`6a348b93`](https://github.com/keystonejs/keystone/commit/6a348b93607c305c4ba61c1406a4acd508f33f64)]:
  - @keystonejs/fields@6.0.0
  - @arch-ui/alert@0.0.9
  - @arch-ui/badge@0.0.9
  - @arch-ui/button@0.0.11
  - @arch-ui/card@0.0.7
  - @arch-ui/confirm@0.0.10
  - @arch-ui/controls@0.1.1
  - @arch-ui/dialog@0.0.11
  - @arch-ui/drawer@0.0.12
  - @arch-ui/dropdown@0.0.10
  - @arch-ui/fields@2.0.3
  - @arch-ui/hooks@0.0.5
  - @arch-ui/icons@0.0.6
  - @arch-ui/input@0.1.2
  - @arch-ui/layout@0.2.6
  - @arch-ui/loading@0.0.10
  - @arch-ui/lozenge@0.0.9
  - @arch-ui/navbar@0.1.3
  - @arch-ui/options@0.0.11
  - @arch-ui/pagination@0.0.11
  - @arch-ui/pill@0.1.8
  - @arch-ui/popout@0.0.10
  - @arch-ui/select@0.1.1
  - @arch-ui/tooltip@0.1.4
  - @arch-ui/typography@0.0.10
  - @keystonejs/build-field-types@5.1.2
  - @keystonejs/field-views-loader@5.1.0

## 5.2.0

### Minor Changes

- [`1a723a54`](https://github.com/keystonejs/keystone/commit/1a723a544a918457a9de241a8387f2ce5b555e50) [#1880](https://github.com/keystonejs/keystone/pull/1880) Thanks [@gautamsi](https://github.com/gautamsi)! - Replaced `RelationShip` field's implementation of `CreateItemModel` with a prop provided by `admin-ui`

  Exported following components from `admin-ui` which can be used outside of `admin-ui` to have same look and feel when working with Lists. One simple use is in custom pages where this can be customized differently than core list pages

  - `List`
  - `ListData`
  - `ListLayout`
  - `ListManage`
  - `FieldSelect`
  - `Search`
  - `ActiveFilters`
  - `Pagination`
  - `CreateItemModal`
  - `DeleteItemModal`
  - `DeleteManyItemsModal`
  - `ListTable`
  - `PageLoading`
  - `ToastContainer`
  - `UpdateManyItemsModal`
  - `Popout`

- [`278d6dba`](https://github.com/keystonejs/keystone/commit/278d6dba345c1f8cb41f59f037191fc0713d8f54) [#1928](https://github.com/keystonejs/keystone/pull/1928) Thanks [@gautamsi](https://github.com/gautamsi)! - Added a font loader to the webpack configuration that will allow loading of css files including in custom pages

### Patch Changes

- [`15e8d580`](https://github.com/keystonejs/keystone/commit/15e8d580333963ae0ce9da55b798a75f0cf25a6f) [#1906](https://github.com/keystonejs/keystone/pull/1906) Thanks [@gautamsi](https://github.com/gautamsi)! - Added a `addToNav` option to custom pages config (defaults to `true`) allowing them to be hidden from the admin UI Nav bar.
- Updated dependencies [[`1a723a54`](https://github.com/keystonejs/keystone/commit/1a723a544a918457a9de241a8387f2ce5b555e50), [`ddfc7845`](https://github.com/keystonejs/keystone/commit/ddfc7845399e5108f7fd68169153983122554e96), [`946eb315`](https://github.com/keystonejs/keystone/commit/946eb3157a1cc4946fe9e2c2b1101edf4918ab86), [`ddbf1063`](https://github.com/keystonejs/keystone/commit/ddbf10630530c7c7c9e388c6b047b2cbac96dab9)]:
  - @keystonejs/fields@5.2.0
  - @keystonejs/build-field-types@5.1.1

## 5.1.0

### Minor Changes

- [`1bc46882`](https://github.com/keystonejs/keystone/commit/1bc46882c1768a1ac098e7219becbdfacdf8dd33) [#1916](https://github.com/keystonejs/keystone/pull/1916) Thanks [@gautamsi](https://github.com/gautamsi)! - Add more props to Listtable and make it usable outside of core admin-ui

* [`a1e26deb`](https://github.com/keystonejs/keystone/commit/a1e26deb45d8c53e5d18b06c6573f66c4375b68c) [#1927](https://github.com/keystonejs/keystone/pull/1927) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Refactored the admin-ui custom pages feature.

  You can now customise the admin-ui by creating a folder named `admin-ui` in your project directory or by specifying a path for hooks in the AdminUIApp constructor:

  ```
  new AdminUIApp({
    hooks: require.resolve('./admin-folder/'),
  });
  ```

  The index file in the admin-ui directory exports an object, which for now should only include pages:

  ```
  import Dashboard from './my-component/dashboard';

  export default {
    pages: () => [
      {
        label: 'A new dashboard',
        path: '',
        component: Dashboard
      },
    ],
  };
  ```

  Hooks are now functions. The pages hook should be a function that returns an array of pages.

  The shape of the pages array hasn't changed, except you can now include page components directly rather than with `require.resolve()`.

  The old API will continue to work but will be deprecated in future.

### Patch Changes

- Updated dependencies [[`a1e26deb`](https://github.com/keystonejs/keystone/commit/a1e26deb45d8c53e5d18b06c6573f66c4375b68c)]:
  - @keystonejs/build-field-types@5.1.0

## 5.0.2

### Patch Changes

- [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad) [#1819](https://github.com/keystonejs/keystone/pull/1819) Thanks [@w01fgang](https://github.com/w01fgang)! - Upgraded `flow` and fixed flow errors and (probably) bugs.

* [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad) [#1819](https://github.com/keystonejs/keystone/pull/1819) Thanks [@w01fgang](https://github.com/w01fgang)! - Upgraded `@emotion/core` and `@emotion/styled`.

- [`5595e4c4`](https://github.com/keystonejs/keystone/commit/5595e4c45c618fa7e13a3d91e3ea3892b4f10475) [#1808](https://github.com/keystonejs/keystone/pull/1808) Thanks [@gautamsi](https://github.com/gautamsi)! - Upgraded `react-apollo` and replaced use of `react-apollo-hooks` with `react-apollo`. `react-apollo` has a similar hooks API to `react-apollo-hooks`.

* [`b17b50c0`](https://github.com/keystonejs/keystone/commit/b17b50c0783dd246786aad1de41136967ad73b5c) [#1910](https://github.com/keystonejs/keystone/pull/1910) Thanks [@gautamsi](https://github.com/gautamsi)! - Upgraded `react-router-dom` to v5.1.2 to make use of `useParams` and other hooks provided by `react-router-dom` v5.1.0.

- [`479597e0`](https://github.com/keystonejs/keystone/commit/479597e0920cbedf28f76c14a95b564282f2c1d9) [#1909](https://github.com/keystonejs/keystone/pull/1909) Thanks [@gautamsi](https://github.com/gautamsi)! - Fixed a bug with loading multiple complex custom pages with `chunkSortMode` option in `HtmlWebpackPlugin`.
- Updated dependencies [[`8735393e`](https://github.com/keystonejs/keystone/commit/8735393ec7b01dd0491700244e915b4b47c1cc53), [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad), [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad), [`20632bca`](https://github.com/keystonejs/keystone/commit/20632bca495058f2845d36fe95650eede0a9ebdc), [`3138013c`](https://github.com/keystonejs/keystone/commit/3138013c49205bd7f9b05833ae6158ebeb281dc0), [`5595e4c4`](https://github.com/keystonejs/keystone/commit/5595e4c45c618fa7e13a3d91e3ea3892b4f10475), [`d0d84603`](https://github.com/keystonejs/keystone/commit/d0d84603628f64be3c76f6624f163aaaa46a6092), [`b17b50c0`](https://github.com/keystonejs/keystone/commit/b17b50c0783dd246786aad1de41136967ad73b5c)]:
  - @keystonejs/build-field-types@5.0.1
  - @arch-ui/button@0.0.10
  - @arch-ui/confirm@0.0.9
  - @arch-ui/controls@0.1.0
  - @arch-ui/dialog@0.0.10
  - @arch-ui/drawer@0.0.11
  - @arch-ui/layout@0.2.5
  - @arch-ui/navbar@0.1.2
  - @arch-ui/pagination@0.0.10
  - @arch-ui/typography@0.0.9
  - @keystonejs/fields@5.1.0
  - @arch-ui/alert@0.0.8
  - @arch-ui/badge@0.0.8
  - @arch-ui/card@0.0.6
  - @arch-ui/dropdown@0.0.9
  - @arch-ui/fields@2.0.2
  - @arch-ui/input@0.1.1
  - @arch-ui/loading@0.0.9
  - @arch-ui/lozenge@0.0.8
  - @arch-ui/options@0.0.10
  - @arch-ui/pill@0.1.7
  - @arch-ui/popout@0.0.9
  - @arch-ui/tooltip@0.1.3

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
