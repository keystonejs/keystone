# @keystonejs/website

## 5.0.2

### Patch Changes

- Updated dependencies [[`946a52fd`](https://github.com/keystonejs/keystone/commit/946a52fd7057bb73f4ffd465ef51498172926866)]:
  - @arch-ui/icons@0.0.6
  - @arch-ui/input@0.1.2
  - @arch-ui/select@0.1.1

## 5.0.1

### Patch Changes

- [`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad) [#1819](https://github.com/keystonejs/keystone/pull/1819) Thanks [@w01fgang](https://github.com/w01fgang)! - Upgraded `@emotion/core` and `@emotion/styled`.
- Updated dependencies [[`8226eb47`](https://github.com/keystonejs/keystone/commit/8226eb4709ea8ad5773c900eaaa96068d3cb6bad)]:
  - @arch-ui/input@0.1.1

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/website

## 1.1.4

- Updated dependencies [464d7579](https://github.com/keystonejs/keystone-5/commit/464d7579):
  - @arch-ui/select@0.1.0

## 1.1.3

- Updated dependencies [7689753c](https://github.com/keystonejs/keystone-5/commit/7689753c):
  - @arch-ui/input@0.1.0

## 1.1.2

### Patch Changes

- [589de757](https://github.com/keystonejs/keystone-5/commit/589de757): quick start documentation page copy improvements

## 1.1.1

### Patch Changes

- [957a40d9](https://github.com/keystonejs/keystone-5/commit/957a40d9): Upgrade react-select

## 1.1.0

### Minor Changes

- [601ad192](https://github.com/keystonejs/keystone-5/commit/601ad192): Remove sizeByPixelDensity option in gatsby-remark-images

## 1.0.13

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade emotion to 10.0.14
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Update gatsby to 2.13.25

## 1.0.12

- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @arch-ui/input@0.0.8

## 1.0.11

### Patch Changes

- [ac119f88](https://github.com/keystonejs/keystone-5/commit/ac119f88):

  Homepage of the documentation website reveals the video on hover/touch of the image to avoid double click on play

- [df48bc05](https://github.com/keystonejs/keystone-5/commit/df48bc05):

  Move meta generation to build time and stringify the contents of title and description nodes properly

- [d362e82d](https://github.com/keystonejs/keystone-5/commit/d362e82d):

  Make previous and next buttons consistent with order in sidebar

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 1.0.10

### Patch Changes

- [b47fb186](https://github.com/keystonejs/keystone-5/commit/b47fb186):

  Documentation website now features the egghead intro video instead of the illustration. The only changes here are on the homepage.

## 1.0.9

### Patch Changes

- [dfcabe6a](https://github.com/keystonejs/keystone-5/commit/dfcabe6a):

  Remove unused dependency

## 1.0.8

- Updated dependencies [d580c298](https://github.com/keystonejs/keystone-5/commit/d580c298):
  - @arch-ui/input@0.0.6
  - @arch-ui/select@0.0.6

## 1.0.7

### Patch Changes

- [2e59d131](https://github.com/keystonejs/keystone-5/commit/2e59d131):

  [docs] Add discussions on Schemas and Relationships

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

- [94ed17bd](https://github.com/keystonejs/keystone-5/commit/94ed17bd):

  [docs] Clearer path to follow immediately following the Quick Start tutorial

* Updated dependencies [81b481d0](https://github.com/keystonejs/keystone-5/commit/81b481d0):
  - @arch-ui/input@0.0.5

## 1.0.6

- Updated dependencies [e75c105c](https://github.com/keystonejs/keystone-5/commit/e75c105c):
  - @arch-ui/select@0.0.4
  - @arch-ui/input@0.0.4
  - @arch-ui/theme@0.0.3

## 1.0.5

- [patch][a76721db](https://github.com/keystonejs/keystone-5/commit/a76721db):

  - Update gatsby dependencies

## 1.0.4

- [patch][2d704f98](https://github.com/keystonejs/keystone-5/commit/2d704f98):

  - Make all docs headers clicky for perma-linking.

## 1.0.3

- [patch][9a9f214a](https://github.com/keystonejs/keystone-5/commit/9a9f214a):

  - Build field type views before publishing to npm and stop running Babel on Keystone packages in node_modules in the Admin UI

## 1.0.2

- [patch][60c13d0d](https://github.com/keystonejs/keystone-5/commit/60c13d0d):

  - Internal code changes

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][3a775092](https://github.com/keystonejs/keystone-5/commit/3a775092):

  - Update dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone-5/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

- [patch][233dd5a1](https://github.com/keystonejs/keystone-5/commit/233dd5a1):

  - Adding trailing slash to quick-start main navigation link to appropriately trigger the active state in the sidebar.

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

- Updated dependencies [d9a1be91](https://github.com/keystonejs/keystone-5/commit/d9a1be91):
  - @arch-ui/select@0.0.3

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/website

## 1.0.1

- [patch] 23c3fee5:

  - Update babel packages and plugins

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] 1855d1ba:

  - Update dependencies with 'yarn audit' identified issues

- [patch] 1b96ad36:

  - Update gatsby dependencies
