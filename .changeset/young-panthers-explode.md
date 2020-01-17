---
'@keystonejs/app-admin-ui': minor
'@keystonejs/fields': minor
'@keystonejs/utils': minor
---

Added `dependsOn` option to fields which allows some fields to be hidden from `admin-ui` based on value from another field.
This is a retro feature from `keystone-classic` aka `keystone v4`. This is only supported in Item edit view and not implemented for Create Item dialog.
**Example**

```js
keystone.createList('MyList', {
  fields: {
    price: { type: Decimal, symbol: '$' },
    discount: { type: Decimal, dependsOn: { $gt: { price: 30 } } }, // discount field is visible in admin ui only if the price field has value greater than 30
  },
});
```

> dependsOn uses [expression-match](https://github.com/inquisive/expression-match) library for checking values from same item
