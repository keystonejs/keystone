# @arch-ui/day-picker

## 1.0.5

### Patch Changes

- [`a79404183`](https://github.com/keystonejs/keystone/commit/a79404183c8080f5db5cc6591ab2fb4ff5398b5f) [#3650](https://github.com/keystonejs/keystone/pull/3650) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `moment` to `^2.28.0`.

* [`b6e160678`](https://github.com/keystonejs/keystone/commit/b6e160678b449707261a54a9d565b91663784831) [#3671](https://github.com/keystonejs/keystone/pull/3671) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@primer/octicons-react` to `^11.0.0`.

## 1.0.4

### Patch Changes

- [`c3488c5e8`](https://github.com/keystonejs/keystone/commit/c3488c5e88628b15eb9fe804551c3c5c44c07e0f) [#3511](https://github.com/keystonejs/keystone/pull/3511) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `intersection-observer` to `^0.11.0`.

* [`a42ee3a30`](https://github.com/keystonejs/keystone/commit/a42ee3a306c899a7ae46909fe132522cbeff7812) [#3508](https://github.com/keystonejs/keystone/pull/3508) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `date-fns` to `^2.16.1`.

## 1.0.3

### Patch Changes

- [`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e) [#3477](https://github.com/keystonejs/keystone/pull/3477) Thanks [@Noviny](https://github.com/Noviny)! - Updating dependencies:

  These changes bring the keystone dev experience inline with installing keystone from npm :D

* [`0fc878fa9`](https://github.com/keystonejs/keystone/commit/0fc878fa918c3196196f943f195ffaa62fce504b) [#3439](https://github.com/keystonejs/keystone/pull/3439) Thanks [@renovate](https://github.com/apps/renovate)! - Updated babel dependencies.

- [`fcf632dbb`](https://github.com/keystonejs/keystone/commit/fcf632dbbc610bbf90dc3647f0acdf8c868b2a8d) [#3466](https://github.com/keystonejs/keystone/pull/3466) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `chrono-node` to `^1.4.8`.

- Updated dependencies [[`5935b89f8`](https://github.com/keystonejs/keystone/commit/5935b89f8862b36f14d09da68f056f759a860f3e), [`0fc878fa9`](https://github.com/keystonejs/keystone/commit/0fc878fa918c3196196f943f195ffaa62fce504b)]:
  - @arch-ui/input@0.1.11
  - @arch-ui/typography@0.0.18
  - @arch-ui/select@0.1.9
  - @arch-ui/theme@0.0.11

## 1.0.2

### Patch Changes

- [`51aef1ef0`](https://github.com/keystonejs/keystone/commit/51aef1ef06a89422e89a6118b7820848d5970669) [#3146](https://github.com/keystonejs/keystone/pull/3146) Thanks [@Vultraz](https://github.com/Vultraz)! - Migrated to @primer/octicons-react v10.

## 1.0.1

### Patch Changes

- [`b693b2fa8`](https://github.com/keystonejs/keystone/commit/b693b2fa8a391d7f5bcfbea11061679bd4b559d8) [#3002](https://github.com/keystonejs/keystone/pull/3002) Thanks [@timleslie](https://github.com/timleslie)! - The `CalendarDay` field type options `yearRangeFrom` and `yearRangeTo` have been removed, and replaced with `dateFrom` and `dateTo`. These options take an ISO8601 formatted date string in the form `YYYY-MM-DD`, e.g. `2020-06-30`. These values are now validated on the server-side, rather than just on the client-side within the Admin UI.

  If you are currently using `yearRangeFrom` or `yearRangeTo` you will need to make the following change:

  ```
  birthday: { type: CalendarDay, yearRangeFrom: 1900, yearRangeTo: 2100 }
  ```

  becomes

  ```
  birthday: { type: CalendarDay, dateFrom: '1900-01-01', dateTo: '2100-12-31' }
  ```

## 1.0.0

### Major Changes

- [`e9a0de2c`](https://github.com/keystonejs/keystone/commit/e9a0de2cc03c211beca01ec206244105bdca6afc) [#2927](https://github.com/keystonejs/keystone/pull/2927) Thanks [@Vultraz](https://github.com/Vultraz)! - Upgraded to date-fns 2.x. This version uses [Unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table) for its formatting strings. A conversion table is available [here](https://github.com/date-fns/date-fns/blob/master/CHANGELOG.md#200---2019-08-20).

  This change only affects the `CalendarDay` and `DateTime` fields' `format` config option.

  The following script utilizes the [`@date-fns/upgrade`](https://github.com/date-fns/date-fns-upgrade) package and can be used to convert old formatting strings:

  ```js
  const { convertTokens } = require('@date-fns/upgrade/v2');

  console.table(
    [
      // Add date-dns 1.x formatting strings here.
    ].map(str => ({
      v1: str,
      v2: convertTokens(str).replace(/'/g, ''),
    }))
  );
  ```

  Do note this converts symbols to standalone style as opposed to formatted style which may not always be desired. For example, `DD/MM/YYYY` would be converted to `dd/LL/yyyy` instead of `dd/MM/yyyy`. See [here](http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Stand-Alone-vs.-Format-Styles) for more information on which you should use.

### Patch Changes

- [`59ed6310`](https://github.com/keystonejs/keystone/commit/59ed6310bacc76f571639de048689becbedbeac5) [#2930](https://github.com/keystonejs/keystone/pull/2930) Thanks [@Vultraz](https://github.com/Vultraz)! - Fixed many usability issues with the CalendarDay field:

  - Fixed field not functioning as a proper controlled component in the Create popout.
  - Fixed field initially displaying "Invalid Date" before defaulting to 1970-01-01.
  - Filter input no longer defaults to the current date. This was bugged; submitting the form with no changes would match nothing.
  - Filter input now falls back to no value when given an invalid date. Previously, it was falling back to 1970-01-01.
  - Fixed filter input not initially displaying the current value when in edit mode (it was displaying the current date).
  - Fixed filter input not being initially focused.
  - Fixed filter input not being submitted properly if focus wasn't lost first.

  Updated chrono-node dependency to 1.4.6.

## 0.0.26

### Patch Changes

- [`5ec4e5d5`](https://github.com/keystonejs/keystone/commit/5ec4e5d547503baeae2ac2f6317b66c2ebae93b7) [#2915](https://github.com/keystonejs/keystone/pull/2915) Thanks [@timleslie](https://github.com/timleslie)! - Updated website related dependencies.

## 0.0.25

### Patch Changes

- [`577b5e69`](https://github.com/keystonejs/keystone/commit/577b5e69ac4f949d1be2a80d8f391cb0a4b1333a) [#2799](https://github.com/keystonejs/keystone/pull/2799) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Upgraded React and Emotion packages.

- Updated dependencies [[`577b5e69`](https://github.com/keystonejs/keystone/commit/577b5e69ac4f949d1be2a80d8f391cb0a4b1333a)]:
  - @arch-ui/icons@0.1.1
  - @arch-ui/input@0.1.9
  - @arch-ui/select@0.1.8
  - @arch-ui/typography@0.0.17

## 0.0.24

### Patch Changes

- Updated dependencies [[`e5fac4db`](https://github.com/keystonejs/keystone/commit/e5fac4db00e1d38c2271d8ca55e7e2bd86a07dfa), [`9c403c7c`](https://github.com/keystonejs/keystone/commit/9c403c7c273cc915d023bd98986d43cd4ab74477)]:
  - @arch-ui/input@0.1.8
  - @arch-ui/icons@0.1.0

## 0.0.23

### Patch Changes

- [`390a7fc3`](https://github.com/keystonejs/keystone/commit/390a7fc3b20169c628dd7aa2e2a4d72b678a345f) [#2424](https://github.com/keystonejs/keystone/pull/2424) Thanks [@Vultraz](https://github.com/Vultraz)! - Improved TextDayPicker interface and fixed a bug with the CalendarDay field where the set date could change when the field lost focus.

## 0.0.22

### Patch Changes

- [`63169b6a`](https://github.com/keystonejs/keystone/commit/63169b6a6b6a4dc286cd224b7f871960f2d4b0ad) [#2638](https://github.com/keystonejs/keystone/pull/2638) Thanks [@Vultraz](https://github.com/Vultraz)! - Removed uses of defaultProps for functional components.

- Updated dependencies [[`63169b6a`](https://github.com/keystonejs/keystone/commit/63169b6a6b6a4dc286cd224b7f871960f2d4b0ad)]:
  - @arch-ui/typography@0.0.16

## 0.0.21

### Patch Changes

- Updated dependencies [[`0de5f232`](https://github.com/keystonejs/keystone/commit/0de5f2321ef8f9fe6dd247c3201372a4156e61e9)]:
  - @arch-ui/theme@0.0.10
  - @arch-ui/input@0.1.7
  - @arch-ui/select@0.1.6
  - @arch-ui/typography@0.0.15

## 0.0.20

### Patch Changes

- [`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded React to 16.13.0.

* [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

* Updated dependencies [[`6b353eff`](https://github.com/keystonejs/keystone/commit/6b353effc8b617137a3978b2c845e01403889722), [`5ba330b8`](https://github.com/keystonejs/keystone/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20), [`9d11d7ce`](https://github.com/keystonejs/keystone/commit/9d11d7cea6f31eeceb7326d86460a3f0e25ad01d)]:
  - @arch-ui/icons@0.0.10
  - @arch-ui/input@0.1.6
  - @arch-ui/select@0.1.5
  - @arch-ui/typography@0.0.14
  - @arch-ui/theme@0.0.9

## 0.0.19

### Patch Changes

- [`d8a7b8a2`](https://github.com/keystonejs/keystone/commit/d8a7b8a23b4c3e1545d101a92323be165ad362e2) [#2395](https://github.com/keystonejs/keystone/pull/2395) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded all `@emotion.*` dependencies.

* [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09) [#2381](https://github.com/keystonejs/keystone/pull/2381) Thanks [@timleslie](https://github.com/timleslie)! - Updated `@babel/*` dependency packages to latest versions.

* Updated dependencies [[`d8a7b8a2`](https://github.com/keystonejs/keystone/commit/d8a7b8a23b4c3e1545d101a92323be165ad362e2), [`dcdd8ed9`](https://github.com/keystonejs/keystone/commit/dcdd8ed9142cf3328a7af80bc167ef93c7669b09)]:
  - @arch-ui/input@0.1.5
  - @arch-ui/typography@0.0.13
  - @arch-ui/icons@0.0.9
  - @arch-ui/select@0.1.4
  - @arch-ui/theme@0.0.8

## 0.0.18

### Patch Changes

- [`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a) [#2144](https://github.com/keystonejs/keystone/pull/2144) - Upgraded all @babel/\* dependencies.
- Updated dependencies [[`38f88b62`](https://github.com/keystonejs/keystone/commit/38f88b62d9592d91b56528d4d9c40e9399440c4a)]:
  - @arch-ui/icons@0.0.8
  - @arch-ui/input@0.1.4
  - @arch-ui/select@0.1.3
  - @arch-ui/theme@0.0.7
  - @arch-ui/typography@0.0.12

## 0.0.17

### Patch Changes

- [`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62) [#2092](https://github.com/keystonejs/keystone/pull/2092) - Upgrade all Babel deps to the same version (7.7.4)
- Updated dependencies [[`129b0f6`](https://github.com/keystonejs/keystone/commit/129b0f61f34adb7482901d2da4ddb14ce1aedd62)]:
  - @arch-ui/icons@0.0.7
  - @arch-ui/input@0.1.3
  - @arch-ui/select@0.1.2
  - @arch-ui/theme@0.0.6
  - @arch-ui/typography@0.0.11

## 0.0.16

### Patch Changes

- [`33d22c7`](https://github.com/keystonejs/keystone/commit/33d22c70971eb047aa670b1cd170248cbd663290) [#2078](https://github.com/keystonejs/keystone/pull/2078) - Fixed several issues with the CalendarDay field:

  - Ensured format, yearRangeFrom, and yearRangeTo defaults are set correctly
  - Removed non-functional yearPickerType
  - Made displayed date format consistent between list and detailed views
  - Moved date range validation to validateInput

## 0.0.15

### Patch Changes

- [`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866) [#1995](https://github.com/keystonejs/keystone/pull/1995) Thanks [@Vultraz](https://github.com/Vultraz)! - Updated `react` and `react-dom` to 16.12.0.
- Updated dependencies [[`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866)]:
  - @arch-ui/icons@0.0.6
  - @arch-ui/input@0.1.2
  - @arch-ui/select@0.1.1
  - @arch-ui/typography@0.0.10

## 0.0.14

### Patch Changes

- [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad) [#1819](https://github.com/keystonejs/keystone/pull/1819) Thanks [@w01fgang](https://github.com/w01fgang)! - Upgraded `flow` and fixed flow errors and (probably) bugs.

* [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad) [#1819](https://github.com/keystonejs/keystone/pull/1819) Thanks [@w01fgang](https://github.com/w01fgang)! - Upgraded `@emotion/core` and `@emotion/styled`.
* Updated dependencies [[`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad), [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad)]:
  - @arch-ui/typography@0.0.9
  - @arch-ui/input@0.1.1

## 0.0.13

- Updated dependencies [464d7579](https://github.com/keystonejs/keystone/commit/464d7579):
  - @arch-ui/select@0.1.0

## 0.0.12

- Updated dependencies [7689753c](https://github.com/keystonejs/keystone/commit/7689753c):
  - @arch-ui/input@0.1.0

## 0.0.11

- Updated dependencies [957a40d9](https://github.com/keystonejs/keystone/commit/957a40d9):
  - @arch-ui/select@0.0.8

## 0.0.10

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone/commit/42c3fbc9): Upgrade emotion to 10.0.14

## 0.0.9

- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone/commit/91fffa1e):
  - @arch-ui/input@0.0.8

## 0.0.8

- Updated dependencies [19fe6c1b](https://github.com/keystonejs/keystone/commit/19fe6c1b):
  - @arch-ui/select@0.0.7
  - @arch-ui/icons@0.0.5
  - @arch-ui/input@0.0.7
  - @arch-ui/theme@0.0.5
  - @arch-ui/typography@0.0.7

## 0.0.7

### Patch Changes

- [71766bd8](https://github.com/keystonejs/keystone/commit/71766bd8):

  Fix "Invalid Date" message when creating new items

* Updated dependencies [d580c298](https://github.com/keystonejs/keystone/commit/d580c298):
  - @arch-ui/input@0.0.6
  - @arch-ui/select@0.0.6
  - @arch-ui/typography@0.0.6

## 0.0.6

### Patch Changes

- [81b481d0](https://github.com/keystonejs/keystone/commit/81b481d0):

  - Added support for isMultiline to Text field type

- [81dc0be5](https://github.com/keystonejs/keystone/commit/81dc0be5):

  - Update dependencies

## 0.0.5

- Updated dependencies [e75c105c](https://github.com/keystonejs/keystone/commit/e75c105c):
  - @arch-ui/select@0.0.4
  - @arch-ui/input@0.0.4
  - @arch-ui/theme@0.0.3
  - @arch-ui/typography@0.0.4

## 0.0.4

- [patch][39067f44](https://github.com/keystonejs/keystone/commit/39067f44):

  - Add text date and time pickers

## 0.0.3

- [patch][11c372fa](https://github.com/keystonejs/keystone/commit/11c372fa):

  - Update minor-level dependencies

- [patch][3a775092](https://github.com/keystonejs/keystone/commit/3a775092):

  - Update dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

- [patch][d9a1be91](https://github.com/keystonejs/keystone/commit/d9a1be91):

  - Update dependencies

- [patch][96015257](https://github.com/keystonejs/keystone/commit/96015257):

  - Update dependencies

- [patch][7417ea3a](https://github.com/keystonejs/keystone/commit/7417ea3a):

  - Update patch-level dependencies

## 0.0.2

- [patch] 23c3fee5:

  - Update babel packages and plugins

- Updated dependencies [113e16d4]:
  - @arch-ui/icons@0.0.2
  - @arch-ui/input@0.0.2
