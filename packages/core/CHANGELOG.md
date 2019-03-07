# @keystone-alpha/core

# @voussoir/core

## 3.0.0

- [patch] 113e16d4:

  - Remove unused dependencies

- [major] 1db45262:

  - Use the `@voussoir/core` package as the entry point for custom servers.

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
           "start": "keystone"
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

          keystoneServer
            .prepare({ port: 3000 })
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
