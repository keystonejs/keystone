# @keystone-alpha/test-utils

## 2.0.4

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

* Updated dependencies [1b4cf4e0](https://github.com/keystonejs/keystone-5/commit/1b4cf4e0):
  - @keystone-alpha/adapter-mongoose@2.1.0
  - @keystone-alpha/adapter-knex@1.0.9
  - @keystone-alpha/keystone@6.0.0

## 2.0.3

### Patch Changes

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

* Updated dependencies [b2651279](https://github.com/keystonejs/keystone-5/commit/b2651279):
  - @keystone-alpha/keystone@5.0.0
  - @keystone-alpha/app-graphql@6.0.0

## 2.0.2

- Updated dependencies [9a0456ff](https://github.com/keystonejs/keystone-5/commit/9a0456ff):
  - @keystone-alpha/adapter-mongoose@2.0.0

## 2.0.1

### Patch Changes

- [81dc0be5](https://github.com/keystonejs/keystone-5/commit/81dc0be5):

  - Update dependencies

* Updated dependencies [24cd26ee](https://github.com/keystonejs/keystone-5/commit/24cd26ee):
* Updated dependencies [2ef2658f](https://github.com/keystonejs/keystone-5/commit/2ef2658f):
* Updated dependencies [ae5cf6cc](https://github.com/keystonejs/keystone-5/commit/ae5cf6cc):
* Updated dependencies [b7a2ea9c](https://github.com/keystonejs/keystone-5/commit/b7a2ea9c):
* Updated dependencies [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):
  - @keystone-alpha/adapter-knex@1.0.7
  - @keystone-alpha/adapter-mongoose@1.0.7
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/server@5.0.0

## 2.0.0

- [patch][7b8d254d](https://github.com/keystonejs/keystone-5/commit/7b8d254d):

  - Update external dependencies

- [patch][88e6224f](https://github.com/keystonejs/keystone-5/commit/88e6224f):

  - Restructure internal code

- [major][21be780b](https://github.com/keystonejs/keystone-5/commit/21be780b):

  - Remove `runQuery` from API.
  - `matchFilter` takes `keystone` as the first parameter, rather than `server`.
  - `graphqlRequest` takes a `keystone` parameter, and no longer takes `server`.

- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):
  - @keystone-alpha/adapter-knex@1.0.5
  - @keystone-alpha/adapter-mongoose@1.0.5
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/server@4.0.0

## 1.1.3

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):
  - @keystone-alpha/adapter-knex@1.0.4
  - @keystone-alpha/adapter-mongoose@1.0.4
  - @keystone-alpha/keystone@2.0.0
  - @keystone-alpha/server@3.0.0

## 1.1.2

- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):
  - @keystone-alpha/keystone@1.0.3
  - @keystone-alpha/server@2.0.0

## 1.1.1

- [patch][11c372fa](https://github.com/keystonejs/keystone-5/commit/11c372fa):

  - Update minor-level dependencies

- [patch][619b17c2](https://github.com/keystonejs/keystone-5/commit/619b17c2):

  - Reformat code using latest version of Prettier (1.16.4)

## 1.1.0

- [minor][c0e64c01](https://github.com/keystonejs/keystone-5/commit/c0e64c01):

  - Add `matchFilter` and `runQuery` functions.

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/test-utils

## 1.0.1

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] b155d942:

  - Update mongo/mongoose dependencies

## 1.0.0

- [minor] dc53492c:

  - Add support for the Knex adapter

- [major] 9f2ee393:

  - Add adapter parameter to setupServer() and add multiAdapterRunners()

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [53e27d75]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [48773907]:
- Updated dependencies [a3d5454d]:
- Updated dependencies [ced0edb3]:
- Updated dependencies [860c3b80]:
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/core@2.0.0
  - @voussoir/server@1.0.0
  - @voussoir/utils@1.0.0
  - @voussoir/adapter-knex@0.0.2

## 0.1.3

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [c83c9ed5]:
- Updated dependencies [c3ebd9e6]:
- Updated dependencies [ebae2d6f]:
- Updated dependencies [78fd9555]:
- Updated dependencies [01718870]:
- Updated dependencies [d22820b1]:
  - @voussoir/adapter-mongoose@1.0.0
  - @voussoir/core@1.0.0
  - @voussoir/server@0.5.0

## 0.1.2

- [patch] 9c383fe8:

  - Always use \$set and { new: true } in the mongoose adapter update() method

- Updated dependencies [45d4c379]:
- Updated dependencies [ae3b8fda]:
- Updated dependencies [b0d19c24]:
  - @voussoir/adapter-mongoose@0.5.0
  - @voussoir/core@0.7.0
  - @voussoir/server@0.4.0

## 0.1.1

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.4.1
  - @voussoir/core@0.6.0

## 0.1.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.4.0
  - @voussoir/core@0.5.0

## 0.0.2

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.3.2
  - @voussoir/core@0.4.0

## 0.0.1

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
