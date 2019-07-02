# @keystone-alpha/fields-wysiwyg-tinymce

## 3.0.2

- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @keystone-alpha/fields@7.1.0
  - @arch-ui/fields@2.0.0
  - @arch-ui/input@0.0.8

## 3.0.1

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):
* Updated dependencies [16befb6a](https://github.com/keystonejs/keystone-5/commit/16befb6a):
  - @keystone-alpha/fields@7.0.0
  - @arch-ui/fields@1.0.0

## 3.0.0

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

## 2.0.1

- Updated dependencies [d580c298](https://github.com/keystonejs/keystone-5/commit/d580c298):
  - @arch-ui/input@0.0.6
  - @keystone-alpha/fields@6.1.1

## 2.0.0

### Major Changes

- [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):

  - Use build-field-types

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

* Updated dependencies [e6e95173](https://github.com/keystonejs/keystone-5/commit/e6e95173):
* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
* Updated dependencies [81b481d0](https://github.com/keystonejs/keystone-5/commit/81b481d0):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
* Updated dependencies [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
  - @keystone-alpha/fields@6.0.0
  - @keystone-alpha/build-field-types@1.0.0
  - @arch-ui/input@0.0.5

## 1.0.2

- Updated dependencies [85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):
- Updated dependencies [e75c105c](https://github.com/keystonejs/keystone-5/commit/e75c105c):
  - @keystone-alpha/fields@5.0.0
  - @arch-ui/fields@0.0.4
  - @arch-ui/input@0.0.4
  - @arch-ui/theme@0.0.3

## 1.0.1

- [patch][6105d999](https://github.com/keystonejs/keystone-5/commit/6105d999):

  - Use compiled Field component to fix webpack compilation error when building Admin UI

- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):
  - @keystone-alpha/fields@4.0.0

## 1.0.0

- [major][b09983c8](https://github.com/keystonejs/keystone-5/commit/b09983c8):

  - Adding WYSIWYG HTML field type powered by TinyMCE
