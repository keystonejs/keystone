---
'@keystonejs/app-admin-ui': minor
'@keystonejs/field-content': minor
'@keystonejs/fields-markdown': minor
'@keystonejs/fields-wysiwyg-tinymce': minor
'@keystonejs/fields': minor
'@keystonejs/cypress-project-access-control': patch
---

* Added `isReadOnly` option on field's `adminConfig`. Fields with this option set will be excluded from the `create` form, and set as disabled in the `update` form in the Admin UI.
* This PR also enables you to see the fields (disabled) in item detail page when you have no `update` access to field.

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
