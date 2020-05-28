---
'@keystonejs/app-admin-ui': minor
---

Enabled the use of `listManageActions` hook in the Admin UI.

Usage: 

```js
// index.js
new AdminUIApp({
  hooks: require.resolve('./admin-ui/'),
});
```

The index file in the `admin-ui` directory should export a hooks which will be packaged for use in the Admin UI during the Keystone build:

```js
// ./admin-ui/index.js
import { DeleteItems } '@keystonejs/admin-ui/components/'
export default {
  // re-implement the default create item button + custom text
  listManageActions: () => (<div><DeleteItems /><p>Hello world</p></div>), 
};
```