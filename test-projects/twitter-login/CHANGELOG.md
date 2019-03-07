# @keystone-alpha/cypress-project-twitter-login

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/cypress-project-twitter-login

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

- [major] 582464a8:

  - Migrate projects to new method of exporting and running keystone instances.

- Updated dependencies [23c3fee5]:
  - @voussoir/fields@3.1.0
  - @voussoir/admin-ui@1.0.1
  - @arch-ui/fields@0.0.2
  - @arch-ui/input@0.0.2

## 1.1.5

- Updated dependencies [723371a0]:
- Updated dependencies [53e27d75]:
- Updated dependencies [306f0b7e]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [5f8043b5]:
- Updated dependencies [48773907]:
- Updated dependencies [ced0edb3]:
- Updated dependencies [860c3b80]:
  - @voussoir/adapter-mongoose@2.0.0
  - @voussoir/admin-ui@1.0.0
  - @voussoir/core@2.0.0
  - @voussoir/fields@3.0.0
  - @voussoir/server@1.0.0

## 1.1.4

- [patch] e4cc314b:

  - Bump

## 1.1.3

- [patch] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- Updated dependencies [8145619f]:
- Updated dependencies [c83c9ed5]:
- Updated dependencies [c3ebd9e6]:
- Updated dependencies [ebae2d6f]:
- Updated dependencies [78fd9555]:
- Updated dependencies [01718870]:
- Updated dependencies [8fc0abb3]:
  - @voussoir/admin-ui@0.7.0
  - @voussoir/fields@2.0.0
  - @voussoir/ui@0.6.0
  - @voussoir/adapter-mongoose@1.0.0
  - @voussoir/core@1.0.0
  - @voussoir/server@0.5.0

## 1.1.2

- Updated dependencies [45d4c379]:
- Updated dependencies [ae3b8fda]:
- Updated dependencies [9c383fe8]:
- Updated dependencies [7a24b92e]:
- Updated dependencies [589dbc02]:
- Updated dependencies [b0d19c24]:
  - @voussoir/adapter-mongoose@0.5.0
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
  - @voussoir/core@0.5.0
  - @voussoir/fields@1.2.0

## 1.0.3

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
- Updated dependencies [5742e25d"
  ]:
  - @voussoir/adapter-mongoose@0.3.2
  - @voussoir/core@0.4.0
  - @voussoir/fields@1.1.0
  - @voussoir/admin-ui@0.3.0

## 1.0.2

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)
- [patch] Updated dependencies [445b699](445b699)
- [patch] Updated dependencies [750a83e](750a83e)
  - @voussoir/admin-ui@0.2.1
  - @voussoir/core@0.3.0
  - @voussoir/fields@1.0.0
  - @voussoir/adapter-mongoose@0.3.0

## 1.0.1

- [patch] Updated dependencies [fed0cdc](fed0cdc)
  - @voussoir/adapter-mongoose@0.2.0
  - @voussoir/admin-ui@0.2.0
  - @voussoir/core@0.2.0
  - @voussoir/fields@0.2.0
  - @voussoir/server@0.2.0
  - @voussoir/ui@0.2.0
