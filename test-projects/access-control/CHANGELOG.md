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

  **Migration Guide**

  <!-- prettier-ignore -->
  1. Ensure your main entry point is `index.js`
  1. Add the new keystone module: `yarn add @voussoir/keystone`
  1. Remove the old keystone module: `yarn remove @voussoir/core`
  1. Update your imports:
      ```diff
      - const { Keystone } = require('@voussoir/core');
      + const { Keystone } = require('@voussoir/keystone');
      ```
  1. Update your `package.json` to start Keystone like so:
      ```json
      {
        "scripts": {
          "start": "keystone",
        }
      }
      ```
  1. Export your `keystone` and (optional) `admin` instances from `index.js`:
      ```javascript
      const keystone = new Keystone(/* .. */);
      const admin = new AdminUI(/* .. */);
      /* .. */
      module.exports = {
        keystone,
        admin,
      };
      ```
  1. Remove any usage of `@voussoir/server` / instantiations of `new WebServer()`
  1. If using an auth strategy, export it:
      ```javascript
      const authStrategy = keystone.createAuthStrategy(/* .. */);
      /* .. */
      module.exports = {
        keystone,
        admin,
        serverConfig: {
          authStrategy,
        },
      };
      ```
  1. If using any custom routes / modifying `server.app` in any way you'll need a
     _Custom Server_:
      1. Create a `server.js` along side your `index.js`
      1. Add the new core package: `yarn add @voussoir/core`
      1. Start with this boilerplate custom server in `server.js`:
          ```javascript
          const keystoneServer = require('@voussoir/core');

          keystoneServer.prepare({ port: 3000 })
            .then(({ server, keystone }) => {

              // [*] Custom routes get attached to `server.app` here.
              // If needed, you can access your Keystone instance via `keystone`.

              return server.start();
            })
            .then(({ port }) => {
              console.log(`Listening on port ${port}`);
            })
            .catch(error => {
              console.error(error);
            });
          ```
      1. Put your custom routes, etc, at the `[*]` marker in `server.js`.
  1. Run `yarn start`

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
