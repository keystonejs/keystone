---
'@keystonejs/app-admin-ui': minor
'@keystonejs/field-content': minor
'@keystonejs/fields-markdown': minor
'@keystonejs/fields-wysiwyg-tinymce': minor
'@keystonejs/fields': minor
'@keystonejs/cypress-project-access-control': patch
---

* Added `isReadOnly` option on field's `adminConfig`. This allows to show them as disabled in `admin-ui` item detail page.
* This PR also enables you to see the fields (disabled) in item detail page when you have no `update` access to field.

example:

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


