# keystone_demo_blog

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
