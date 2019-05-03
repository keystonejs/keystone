# @keystone-alpha/cypress-project-access-control

## 1.0.7

- [patch][e75c105c](https://github.com/keystonejs/keystone-5/commit/e75c105c):

  - admin revamp

- Updated dependencies [85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):
  - @keystone-alpha/admin-ui@3.1.0
  - @keystone-alpha/keystone@3.1.0
  - @keystone-alpha/fields@5.0.0

## 1.0.6

- [patch][b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):

  - Use named exports from @keystone-alpha/keystone package.

- [patch][b69fb9b7](https://github.com/keystonejs/keystone-5/commit/b69fb9b7):

  - Update dev devependencies

- [patch][656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):

  - Explicitly call keystone.connect() before starting the web server.

- Updated dependencies [37dcee37](https://github.com/keystonejs/keystone-5/commit/37dcee37):
- Updated dependencies [656e90c2](https://github.com/keystonejs/keystone-5/commit/656e90c2):
- Updated dependencies [b4dcf44b](https://github.com/keystonejs/keystone-5/commit/b4dcf44b):
  - @keystone-alpha/admin-ui@3.0.6
  - @keystone-alpha/keystone@3.0.0
  - @keystone-alpha/fields@4.0.0
  - @keystone-alpha/adapter-mongoose@1.0.5
  - @keystone-alpha/core@2.0.3
  - @keystone-alpha/server@4.0.0

## 1.0.5

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

- Updated dependencies [98c02a46](https://github.com/keystonejs/keystone-5/commit/98c02a46):
  - @keystone-alpha/adapter-mongoose@1.0.3
  - @keystone-alpha/admin-ui@3.0.2
  - @keystone-alpha/fields@3.0.1
  - @keystone-alpha/keystone@1.0.4
  - @keystone-alpha/server@2.0.2
  - @keystone-alpha/utils@2.0.0

## 1.0.3

- [patch][de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):

  - Use new authStrategy APIs

- Updated dependencies [9a9f214a](https://github.com/keystonejs/keystone-5/commit/9a9f214a):
- Updated dependencies [de616f7e](https://github.com/keystonejs/keystone-5/commit/de616f7e):
- Updated dependencies [4ed35dfd](https://github.com/keystonejs/keystone-5/commit/4ed35dfd):
  - @keystone-alpha/keystone@1.0.3
  - @keystone-alpha/admin-ui@3.0.0
  - @keystone-alpha/fields@3.0.0
  - @keystone-alpha/core@2.0.0
  - @keystone-alpha/server@2.0.0

## 1.0.2

- [patch][3a775092](https://github.com/keystonejs/keystone-5/commit/3a775092):

  - Update dependencies

- Updated dependencies [dcb93771](https://github.com/keystonejs/keystone-5/commit/dcb93771):
  - @keystone-alpha/keystone@1.0.2
  - @keystone-alpha/admin-ui@2.0.0
  - @keystone-alpha/fields@2.0.0

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][c0e64c01](https://github.com/keystonejs/keystone-5/commit/c0e64c01):

  - Move system tests into api-tests package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/cypress-project-access-control

## 2.0.0

- [patch] 70187044:

  - Move some dependencies into devDependencies

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [patch] 1855d1ba:

  - Update dependencies with 'yarn audit' identified issues

- [patch] b155d942:

  - Update mongo/mongoose dependencies

- [major] 582464a8:

  - Migrate projects to new method of exporting and running keystone instances.

## 1.1.5

- [patch] 9f2ee393:

  - Add adapter parameter to setupServer() and add multiAdapterRunners()

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [53e27d75]:
- Updated dependencies [306f0b7e]:
- Updated dependencies [dc53492c]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [5f8043b5]:
- Updated dependencies [48773907]:
- Updated dependencies [a3d5454d]:
- Updated dependencies [ced0edb3]:
- Updated dependencies [860c3b80]:
  - @voussoir/test-utils@1.0.0
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/admin-ui@1.0.0
  - @voussoir/core@2.0.0
  - @voussoir/fields@3.0.0
  - @voussoir/server@1.0.0
  - @voussoir/utils@1.0.0

## 1.1.4

- [patch] e4cc314b:

  - Bump

## 1.1.3

- [patch] 8145619f:

  - update to selecting and managing items in the list view

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [c83c9ed5]:
- Updated dependencies [c3ebd9e6]:
- Updated dependencies [ebae2d6f]:
- Updated dependencies [78fd9555]:
- Updated dependencies [01718870]:
- Updated dependencies [d22820b1]:
- Updated dependencies [8fc0abb3]:
  - @voussoir/adapter-mongoose@1.0.0
  - @voussoir/test-utils@0.1.3
  - @voussoir/admin-ui@0.7.0
  - @voussoir/core@1.0.0
  - @voussoir/fields@2.0.0
  - @voussoir/server@0.5.0
  - @voussoir/ui@0.6.0

## 1.1.2

- Updated dependencies [45d4c379]:
- Updated dependencies [ae3b8fda]:
- Updated dependencies [9c383fe8]:
- Updated dependencies [7a24b92e]:
- Updated dependencies [589dbc02]:
- Updated dependencies [b0d19c24]:
  - @voussoir/adapter-mongoose@0.5.0
  - @voussoir/test-utils@0.1.2
  - @voussoir/core@0.7.0
  - @voussoir/fields@1.4.0
  - @voussoir/server@0.4.0
  - @voussoir/admin-ui@0.6.0
  - @voussoir/ui@0.5.0

## 1.1.1

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
- Updated dependencies [1d30a329"
  ]:
  - @voussoir/adapter-mongoose@0.4.1
  - @voussoir/test-utils@0.1.1
  - @voussoir/core@0.6.0
  - @voussoir/fields@1.3.0
  - @voussoir/admin-ui@0.5.0
  - @voussoir/ui@0.4.0

## 1.1.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.4.0
  - @voussoir/test-utils@0.1.0
  - @voussoir/core@0.5.0
  - @voussoir/fields@1.2.0

## 1.0.3

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
- Updated dependencies [5742e25d"
  ]:
  - @voussoir/adapter-mongoose@0.3.2
  - @voussoir/test-utils@0.0.2
  - @voussoir/core@0.4.0
  - @voussoir/fields@1.1.0
  - @voussoir/admin-ui@0.3.0

## 1.0.2

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [patch] Updated dependencies [445b699](445b699)
- [patch] Updated dependencies [9c75136](9c75136)
- [patch] Updated dependencies [750a83e](750a83e)
  - @voussoir/admin-ui@0.2.1
  - @voussoir/core@0.3.0
  - @voussoir/fields@1.0.0
  - @voussoir/adapter-mongoose@0.3.0
  - @voussoir/server@0.2.1
  - @voussoir/utils@0.2.0

## 1.0.1

- [patch] Updated dependencies [fed0cdc](fed0cdc)
  - @voussoir/adapter-mongoose@0.2.0
  - @voussoir/admin-ui@0.2.0
  - @voussoir/core@0.2.0
  - @voussoir/fields@0.2.0
  - @voussoir/server@0.2.0
  - @voussoir/ui@0.2.0
