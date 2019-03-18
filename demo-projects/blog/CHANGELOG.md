# keystone_demo_blog

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
