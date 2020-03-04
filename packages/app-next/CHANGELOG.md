# @keystonejs/app-next

## 5.1.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

## 5.0.2

### Patch Changes

- [`51500a82`](https://github.com/keystonejs/keystone/commit/51500a82644bf65e6a06bef0d2dd4aa1a2d5d135) [#2244](https://github.com/keystonejs/keystone/pull/2244) - Bump next.js dep to ^9.2.0

## 5.0.1

### Patch Changes

- [`f3e99022`](https://github.com/keystonejs/keystone/commit/f3e990222f35889163b4976e4465729fd25d416f) [#1955](https://github.com/keystonejs/keystone/pull/1955) Thanks [@gautamsi](https://github.com/gautamsi)! - Upgraded NextJs to `^9.1.0` from `^9.0.0`.

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/app-next

## 2.1.0

### Minor Changes

- [700cd9c6](https://github.com/keystonejs/keystone-5/commit/700cd9c6): NextApp: Throw an error if the 'dir' config option is not set. Also set the default config to an empty object.

### Patch Changes

- [7c0908d7](https://github.com/keystonejs/keystone-5/commit/7c0908d7): Update documentation for NextApp

## 2.0.0

### Major Changes

- [db212300](https://github.com/keystonejs/keystone-5/commit/db212300):

  Upgrade next to v9 and remove support for next-routes. You should switch to the native support for dynamic routes in next@9

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
