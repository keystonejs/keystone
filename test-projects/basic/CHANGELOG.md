# @voussoir/cypress-project-basic

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

- Updated dependencies [23c3fee5]:
  - @voussoir/fields@3.1.0
  - @voussoir/admin-ui@1.0.1
  - @arch-ui/fields@0.0.2

## 1.5.0

- [minor] dc53492c:

  - Add support for the Knex adapter

- [patch] 9f2ee393:

  - Add adapter parameter to setupServer() and add multiAdapterRunners()

- Updated dependencies [723371a0]:
- Updated dependencies [aca26f71]:
- Updated dependencies [53e27d75]:
- Updated dependencies [6471fc4a]:
- Updated dependencies [306f0b7e]:
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
  - @voussoir/adapter-knex@0.0.2

## 1.4.1

- [patch] e4cc314b:

  - Bump

- [patch] 6d8ce0fc:

  - Add createMany and updateMany mutations

## 1.4.0

- [patch] 8145619f:

  - update to selecting and managing items in the list view

- [minor] 01718870:

  - Field configuration now tasks isRequired and isUnique, rather than required and unique

- [patch] d22820b1:

  - Rename keystone.session to keystone.sessionManager
    - Rename keystone.session.validate to keystone.sessionManager.populateAuthedItemMiddleware
    - Rename keystone.session.create to keystone.sessionManager.startAuthedSession
    - Rename keystone.session.destroy to keystone.sessionManager.endAuthedSession

- [patch] fc1a9055:

  - Update dependencies to latest patch versions

- Updated dependencies [c83c9ed5]:
- Updated dependencies [c3ebd9e6]:
- Updated dependencies [ebae2d6f]:
- Updated dependencies [78fd9555]:
- Updated dependencies [8fc0abb3]:
  - @voussoir/adapter-mongoose@1.0.0
  - @voussoir/test-utils@0.1.3
  - @voussoir/admin-ui@0.7.0
  - @voussoir/core@1.0.0
  - @voussoir/fields@2.0.0
  - @voussoir/server@0.5.0
  - @voussoir/ui@0.6.0

## 1.3.0

- [patch] 7a24b92e:

  - sticky table headers in list view for supporting browsers

- [minor] 589dbc02:

  - navigation improvements and paper cut fixes

- Updated dependencies [45d4c379]:
- Updated dependencies [ae3b8fda]:
- Updated dependencies [9c383fe8]:
- Updated dependencies [b0d19c24]:
  - @voussoir/adapter-mongoose@0.5.0
  - @voussoir/test-utils@0.1.2
  - @voussoir/core@0.7.0
  - @voussoir/fields@1.4.0
  - @voussoir/server@0.4.0

## 1.2.1

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

## 1.2.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
  - @voussoir/adapter-mongoose@0.4.0
  - @voussoir/test-utils@0.1.0
  - @voussoir/core@0.5.0
  - @voussoir/fields@1.2.0

## 1.1.2

- Updated dependencies [d94b517]:
- Updated dependencies [a3b995c]:
- Updated dependencies [5742e25d"
  ]:
  - @voussoir/adapter-mongoose@0.3.2
  - @voussoir/test-utils@0.0.2
  - @voussoir/core@0.4.0
  - @voussoir/fields@1.1.0
  - @voussoir/admin-ui@0.3.0

## 1.1.1

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

## 1.1.0

- [minor] Add missing dependencies for which the mono-repo was hiding that they were missing [fed0cdc](fed0cdc)
