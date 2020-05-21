---
'@keystonejs/app-admin-ui': minor
'@keystonejs/field-content': minor
'@keystonejs/fields-markdown': minor
'@keystonejs/fields-wysiwyg-tinymce': minor
'@keystonejs/fields': minor
'@keystonejs/cypress-project-access-control': patch
---

* Added `isReadOnly` option on field's `adminConfig`. Fields with this option set will be excluded from the `create` form, and set as disabled in the `update` form in the Admin UI.
* Updated the item detail page to include fields with access `{ update: false }` in a disabled state, rather than excluded the form.

Example:

```js
keystone.createList('Todo', {
  fields: {
    name: { type: Text, isRequired: true },
    someReadOnlyField: {
      type: Text,
      adminConfig: {
        isReadOnly: true,
      },
      defaultValue: 'Some default value',
    },
  },
});
```
