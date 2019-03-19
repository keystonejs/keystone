- Update authStrategy APIs
  * Removes `authStrategy` from the `config` API of `Webserver`.
  * Removes `authStrategy` from the `serverConfig` of the core `keystone` system builder.
  * Removes the `setAuthStrategy` method from `AdminUI`.
  * Adds `authStrategy` to the `config` API of `AdminUI`.
  * `Webserver` checks `keystone.auth` to determine whether to set up auth session middlewares.
