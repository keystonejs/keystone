# @keystone-alpha/demo-project-meetup

## 0.0.1

### Patch Changes

- [0ea974f9](https://github.com/keystonejs/keystone-5/commit/0ea974f9):

  Add to changeset set, so we don't end up in an error state

- [b22d6c16](https://github.com/keystonejs/keystone-5/commit/b22d6c16):

  Remove custom server execution from the CLI.

  The Keystone CLI does not execute custom servers anymore, instead of running `keystone` to start a Keystone instance that has a custom server, run the server file directly with `node`.

  ```diff
  - "start": "keystone",
  + "start": "node server.js"
  ```

- [6f598e83](https://github.com/keystonejs/keystone-5/commit/6f598e83):

  - Add Admin UI static building

* Updated dependencies [9dbed649](https://github.com/keystonejs/keystone-5/commit/9dbed649):
  - @keystone-alpha/admin-ui@3.2.0
  - @keystone-alpha/fields-wysiwyg-tinymce@2.0.0
  - @keystone-alpha/keystone@4.0.0
  - @keystone-alpha/fields@6.0.0
