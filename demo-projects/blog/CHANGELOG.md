# keystone_demo_blog

## 2.0.1

- Updated dependencies [144e6e86](https://github.com/keystonejs/keystone-5/commit/144e6e86):
  - @keystone-alpha/fields@10.2.0
  - @keystone-alpha/adapter-mongoose@4.0.0
  - @keystone-alpha/keystone@10.0.0

## 2.0.0

### Major Changes

- [d7819a55](https://github.com/keystonejs/keystone-5/commit/d7819a55): Switch to Next.js 9 dynamic routes, and use a Slug field instead of the `id` for routes.

## 1.2.7

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade emotion to 10.0.14
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade prettier to 1.18.2
- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
- Updated dependencies [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9):
  - @keystone-alpha/adapter-mongoose@3.0.0
  - @keystone-alpha/keystone@9.0.0
  - @keystone-alpha/fields@10.0.0
  - @keystone-alpha/fields-markdown@1.0.3
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.5
  - @keystone-alpha/app-admin-ui@5.1.0

## 1.2.6

- Updated dependencies [4007f5dd](https://github.com/keystonejs/keystone-5/commit/4007f5dd):
  - @keystone-alpha/adapter-mongoose@2.2.1
  - @keystone-alpha/keystone@8.0.0
  - @keystone-alpha/fields@9.1.0

## 1.2.5

### Patch Changes

- [db212300](https://github.com/keystonejs/keystone-5/commit/db212300):

  Upgrade next to v9 and remove support for next-routes. You should switch to the native support for dynamic routes in next@9

* Updated dependencies [2b094b7f](https://github.com/keystonejs/keystone-5/commit/2b094b7f):
  - @keystone-alpha/app-admin-ui@5.0.4
  - @keystone-alpha/fields-markdown@1.0.2
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.4
  - @keystone-alpha/fields@9.0.0
  - @keystone-alpha/keystone@7.0.3

## 1.2.4

- Updated dependencies [b6a9f6b9](https://github.com/keystonejs/keystone-5/commit/b6a9f6b9):
  - @keystone-alpha/app-admin-ui@5.0.3
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.3
  - @keystone-alpha/keystone@7.0.2
  - @keystone-alpha/fields@8.0.0

## 1.2.3

- Updated dependencies [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):
  - @keystone-alpha/adapter-mongoose@2.2.0
  - @keystone-alpha/keystone@7.0.0

## 1.2.2

### Patch Changes

- [dc2cd8e5](https://github.com/keystonejs/keystone-5/commit/dc2cd8e5):

  Allow changing to default dashboard to a custom component

* Updated dependencies [30c1b1e1](https://github.com/keystonejs/keystone-5/commit/30c1b1e1):
* Updated dependencies [5c28c142](https://github.com/keystonejs/keystone-5/commit/5c28c142):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
* Updated dependencies [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):
* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
  - @keystone-alpha/app-admin-ui@5.0.0
  - @keystone-alpha/fields-wysiwyg-tinymce@3.0.1
  - @keystone-alpha/keystone@6.0.0
  - @keystone-alpha/fields@7.0.0
  - @keystone-alpha/oembed-adapters@1.0.0
  - @keystone-alpha/adapter-mongoose@2.1.0
  - @keystone-alpha/app-graphql@6.1.0
  - @keystone-alpha/app-next@1.0.2
  - @keystone-alpha/app-static@1.0.2
  - @arch-ui/layout@0.2.3
  - @arch-ui/typography@0.0.7
  - @keystone-alpha/file-adapters@1.1.1

## 1.2.1

### Patch Changes

- [af3f31dd](https://github.com/keystonejs/keystone-5/commit/af3f31dd):

  Correct the blog demo build config

## 1.2.0

### Minor Changes

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

### Patch Changes

- [8494e4cc](https://github.com/keystonejs/keystone-5/commit/8494e4cc):

  `@keystone-alpha/app-admin-ui` no longer accepts a `keystone` paramater in its constructor. It is now automatically passed during the `keystone.prepare()` call.

* Updated dependencies [666e15f5](https://github.com/keystonejs/keystone-5/commit/666e15f5):
* Updated dependencies [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):
  - @keystone-alpha/keystone@5.0.0
  - @keystone-alpha/app-admin-ui@4.0.0
  - @keystone-alpha/app-graphql@6.0.0

## 1.1.1

### Patch Changes

- [9b6fec3e](https://github.com/keystonejs/keystone-5/commit/9b6fec3e):

  Remove unnecessary dependency from packages

* Updated dependencies [d580c298](https://github.com/keystonejs/keystone-5/commit/d580c298):
* Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone-5/commit/9a0456ff):
  - @arch-ui/layout@0.2.2
  - @keystone-alpha/fields-wysiwyg-tinymce@2.0.1
  - @keystone-alpha/admin-ui@3.2.1
  - @arch-ui/typography@0.0.6
  - @keystone-alpha/fields@6.1.1
  - @keystone-alpha/adapter-mongoose@2.0.0

## 1.1.0

### Minor Changes

- [22ec53a8](https://github.com/keystonejs/keystone-5/commit/22ec53a8):

  - Adding support for custom pages in Admin UI

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

- [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):

  - Use named export from @keystone-alpha/fields-wysiwyg-tinymce

- [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):

  Remove custom server execution from the CLI.

  The Keystone CLI does not execute custom servers anymore, instead of running `keystone` to start a Keystone instance that has a custom server, run the server file directly with `node`.

  ```diff
  - "start": "keystone",
  + "start": "node server.js"
  ```

- [6f598e83](https://github.com/keystonejs/keystone-5/commit/6f598e83):

  - Add Admin UI static building

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone-5/commit/24cd26ee):
* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone-5/commit/ae5cf6cc):
* Updated dependencies [1a7b706c](https://github.com/keystonejs/keystone-5/commit/1a7b706c):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
* Updated dependencies [bd0ea21f](https://github.com/keystonejs/keystone-5/commit/bd0ea21f):
* Updated dependencies [119448fc](https://github.com/keystonejs/keystone-5/commit/119448fc):
  - @keystone-alpha/adapter-mongoose@1.0.7
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/admin-ui@3.2.0
  - @keystone-alpha/fields-wysiwyg-tinymce@2.0.0
  - @keystone-alpha/fields@6.0.0
  - @keystone-alpha/core@2.0.4
  - @keystone-alpha/server@5.0.0

## 1.0.7

- [patch][e75c105c](https://github.com/keystonejs/keystone-5/commit/e75c105c):

  - admin revamp

- Updated dependencies [85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):
  - @keystone-alpha/admin-ui@3.1.0
  - @keystone-alpha/fields-wysiwyg-tinymce@1.0.2
  - @keystone-alpha/keystone@3.1.0
  - @keystone-alpha/fields@5.0.0

## 1.0.6

- [patch][b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):

  - Explicitly call keystone.connect() before starting the web server.

- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):
- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):
  - @keystone-alpha/admin-ui@3.0.6
  - @keystone-alpha/fields-wysiwyg-tinymce@1.0.1
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/fields@4.0.0
  - @keystone-alpha/adapter-mongoose@1.0.5
  - @keystone-alpha/core@2.0.3
  - @keystone-alpha/server@4.0.0

## 1.0.5

- [patch][b09983c8](https://github.com/keystonejs/keystone-5/commit/b09983c8):

  - Adding WYSIWYG HTML field type powered by TinyMCE

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):
  - @keystone-alpha/adapter-mongoose@1.0.4
  - @keystone-alpha/keystone@2.0.0
  - @keystone-alpha/core@2.0.2
  - @keystone-alpha/server@3.0.0

## 1.0.4

- [patch][5ddb2ed6](https://github.com/keystonejs/keystone-5/commit/5ddb2ed6):

  - Always display clickable links when starting a server in dev mode

## 1.0.3

- [patch][de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):

  - Use new authStrategy APIs

- [patch][ee769467](https://github.com/keystonejs/keystone-5/commit/ee769467):

  - Env vars for PORT config and documentation on demos/project templates

- Updated dependencies [9a9f214a](https://github.com/keystonejs/keystone-5/commit/9a9f214a):
- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):
- Updated dependencies [4ed35dfd](https://github.com/keystonejs/keystone-5/commit/4ed35dfd):
  - @keystone-alpha/keystone@1.0.3
  - @keystone-alpha/admin-ui@3.0.0
  - @keystone-alpha/fields@3.0.0
  - @keystone-alpha/core@2.0.0
  - @keystone-alpha/server@2.0.0

## 1.0.2

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][3a775092](https://github.com/keystonejs/keystone-5/commit/3a775092):

  - Update dependencies

- [patch][d9a1be91](https://github.com/keystonejs/keystone-5/commit/d9a1be91):

  - Update dependencies

- [patch][7417ea3a](https://github.com/keystonejs/keystone-5/commit/7417ea3a):

  - Update patch-level dependencies

- Updated dependencies [dcb93771](https://github.com/keystonejs/keystone-5/commit/dcb93771):
  - @keystone-alpha/keystone@1.0.2
  - @keystone-alpha/admin-ui@2.0.0
  - @keystone-alpha/fields@2.0.0

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

## 2.0.0

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] df17fcd3:

  - Update to next v8

- [major] 582464a8:

  - Migrate projects to new method of exporting and running keystone instances.

- [patch] d0fbd66f:

  - Update apollo dependencies on both client and server

## 1.0.1

- Updated dependencies [6471fc4a]:
- Updated dependencies [5f8043b5]:
- Updated dependencies [a3d5454d]:
  - @voussoir/fields@3.0.0
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/core@2.0.0
  - @voussoir/admin-ui@1.0.0
  - @voussoir/server@1.0.0
  - @voussoir/utils@1.0.0
