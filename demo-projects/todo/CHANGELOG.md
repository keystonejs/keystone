# @keystone-alpha/demo-project-todo

## 1.0.6

- Updated dependencies [85b74a2c](https://github.com/keystonejs/keystone-5/commit/85b74a2c):
  - @keystone-alpha/admin-ui@3.1.0
  - @keystone-alpha/keystone@3.1.0
  - @keystone-alpha/fields@5.0.0

## 1.0.5

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

## 1.0.4

- [patch][06ca8a99](https://github.com/keystonejs/keystone-5/commit/06ca8a99):

  - Adding intro text + link to admin UI

- Updated dependencies [8d385ede](https://github.com/keystonejs/keystone-5/commit/8d385ede):
- Updated dependencies [5ebf4c3a](https://github.com/keystonejs/keystone-5/commit/5ebf4c3a):
- Updated dependencies [52f1c47b](https://github.com/keystonejs/keystone-5/commit/52f1c47b):
  - @keystone-alpha/adapter-mongoose@1.0.4
  - @keystone-alpha/keystone@2.0.0
  - @keystone-alpha/core@2.0.2
  - @keystone-alpha/server@3.0.0

## 1.0.3

- [patch][08d3ddc9](https://github.com/keystonejs/keystone-5/commit/08d3ddc9):

  - Use server.express in TODO demo project

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

# @voussoir/demo-project-todo

## 2.0.0

- [patch] 6fa810f7:

  - Rename `@voussoir/core` -> `@voussoir/keystone`. This is to free up the
    `@voussoir/core` package for a different purpose, and make the main import for
    new Keystone projects be `@voussoir/keystone`. The exports have stayed the
    same.

- [patch] 113e16d4:

  - Remove unused dependencies

- [major] 582464a8:

  - Migrate projects to new method of exporting and running keystone instances.

## 1.0.2

- [patch] 64e6abcc:

  - Allow lists and fields to specify a schemaDoc field

## 1.0.1

- Updated dependencies [6471fc4a]:
- Updated dependencies [5f8043b5]:
- Updated dependencies [48773907]:
  - @voussoir/fields@3.0.0
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/core@2.0.0
  - @voussoir/admin-ui@1.0.0
