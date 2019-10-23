# @keystone/app-static

## 5.0.0

### Major Changes

- [`c7ba40ec`](https://github.com/keystonejs/keystone-5/commit/c7ba40ec98116603c6b7a501d2442e16170ec6be) [#1813](https://github.com/keystonejs/keystone-5/pull/1813) Thanks [@jesstelford](https://github.com/jesstelford)! - - This is the first release of `@keystone/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystone` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystone/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/app-static

## 1.1.2

### Patch Changes

- [9b532072](https://github.com/keystonejs/keystone-5/commit/9b532072): Rename Keystone to KeystoneJS in docs where possible in docs

## 1.1.1

### Patch Changes

- [5598701f](https://github.com/keystonejs/keystone-5/commit/5598701f): throwing errors when the StaticApp doesn't have a string valued passed to the "path" or "src" properties

## 1.1.0

### Minor Changes

- [fe23c719](https://github.com/keystonejs/keystone-5/commit/fe23c719): Added a new fallback option to support client-side routing

## 1.0.3

### Patch Changes

- [42c3fbc9](https://github.com/keystonejs/keystone-5/commit/42c3fbc9): Upgrade express to 4.17.1

## 1.0.2

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 1.0.1

### Patch Changes

- [af3f31dd](https://github.com/keystonejs/keystone-5/commit/af3f31dd):

  Output builds to correct directory

## 1.0.0

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
