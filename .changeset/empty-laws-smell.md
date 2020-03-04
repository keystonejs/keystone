---
'@keystonejs/app-admin-ui': minor
---

Enabled the use of `listItemActions` hook in the Admin UI.

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
import { ItemDropDown } '@keystonejs/admin-ui/components/'
const dropDownItem = {
  content: 'Hello world',
  icon: <PencilIcon />,
  onClick: () => console.log('Hello World'),
};
export default {
  // re-implement the default dropdown with additional items
  listItemActions: () => (<ItemDropDown items={[dropDownItem]} />), 
};
```