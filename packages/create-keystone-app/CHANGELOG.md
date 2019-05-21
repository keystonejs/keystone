# create-keystone-app

## 0.6.0

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
      +  servers: [admin],
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

- [168cc5ed](https://github.com/keystonejs/keystone-5/commit/168cc5ed):

  Add linebreak before title

- [8494e4cc](https://github.com/keystonejs/keystone-5/commit/8494e4cc):

  `@keystone-alpha/app-admin-ui` no longer accepts a `keystone` paramater in its constructor. It is now automatically passed during the `keystone.prepare()` call.

## 0.5.1

### Patch Changes

- [9b6fec3e](https://github.com/keystonejs/keystone-5/commit/9b6fec3e):

  Remove unnecessary dependency from packages

## 0.5.0

### Minor Changes

- [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):

  Update template to account for the removal of custom server execution in the Keystone CLI

## 0.4.2

- [patch][e3337a7d](https://github.com/keystonejs/keystone-5/commit/e3337a7d):

  - Refactor internal code for future testability

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [patch][656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):

  - Explicitly call keystone.connect() before starting the web server.

- [patch][302930a4](https://github.com/keystonejs/keystone-5/commit/302930a4):

  - Minor internal code cleanups

## 0.4.1

- [patch][05ee3533](https://github.com/keystonejs/keystone-5/commit/05ee3533):

  - Updating the template to match the changes in the todo demo app

## 0.4.0

- [minor][5c038b72](https://github.com/keystonejs/keystone-5/commit/5c038b72):

  - Improve CLI output for `create-keystone-app`

- [patch][5ddb2ed6](https://github.com/keystonejs/keystone-5/commit/5ddb2ed6):

  - Always display clickable links when starting a server in dev mode

- [patch][341178c5](https://github.com/keystonejs/keystone-5/commit/341178c5):

  - Better create-keystone-app comments and docs

## 0.3.2

- [patch][](https://github.com/keystonejs/keystone-5/commit/):

  - Bump template dependencies

## 0.3.1

- [patch][08d3ddc9](https://github.com/keystonejs/keystone-5/commit/08d3ddc9):

  - Use server.express in TODO demo project

- [patch][ee769467](https://github.com/keystonejs/keystone-5/commit/ee769467):

  - Env vars for PORT config and documentation on demos/project templates

## 0.3.0

- [patch][1a6ca7ae](https://github.com/keystonejs/keystone-5/commit/1a6ca7ae):

  - Improve error handling and reporting in CLI app

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [minor][c5136b2d](https://github.com/keystonejs/keystone-5/commit/c5136b2d):

  - Added no-deps argument

- [patch][619b17c2](https://github.com/keystonejs/keystone-5/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

## 0.2.0

- [minor][fc22351d](https://github.com/keystonejs/keystone-5/commit/fc22351d):

  - Initial release for create-keystone-app. This will enable quick start based on todo demo project
