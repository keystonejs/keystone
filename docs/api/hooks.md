<!--[meta]
section: api
title: Hooks
order: 7
[meta]-->

# Hooks

The APIs for each hook are mostly the same across the 3 hook types
([list hooks](https://v5.keystonejs.com/guides/hooks#list-hooks), [field hooks](https://v5.keystonejs.com/guides/hooks#field-hooks), [field type
hooks](https://v5.keystonejs.com/guides/hooks#field-type-hooks)).

Any differences are called out in the documentation below.

## Usage

```javascript
keystone.createList('User', {
  fields: {
    name: {
      type: Text
      hooks: { /* hooks config */ },
    },
  },
  hooks: { /* hooks config */ },
  ...
});
```

## Config

| option           | Type       | Description                                                                          |
| ---------------- | ---------- | ------------------------------------------------------------------------------------ |
| `resolveInput`   | `Function` | Executed after access control checks and default values are assigned.                |
| `validateInput`  | `Function` | Executed after `resolveInput`. Should throw if `resolvedData` is invalid.            |
| `beforeChange`   | `Function` | Executed after `validateInput`.                                                      |
| `afterChange`    | `Function` | Executed once the mutation has been completed and all transactions finalised.        |
| `validateDelete` | `Function` | Executed after access control checks. Should throw if `resolvedData` is invalid.     |
| `beforeDelete`   | `Function` | Executed after `validateDelete`.                                                     |
| `afterDelete`    | `Function` | Executed once the delete mutation has been completed and all transactions finalised. |

### `resolveInput`

Executed after access control checks and default values are assigned. Used to modify the `resolvedData`.

The result of `resolveInput` can be a `Promise` or an `Object`. It should have the same structure as the `resolvedData`.

The result is passed to [the next function in the execution order](/guides/hooks/#hook-execution-order).

_Note_: `resolveInput` is not executed for deleted items.

#### Usage:

<!-- prettier-ignore -->
```javascript
const resolveInput = ({
  resolvedData,
  existingItem,
  originalInput,
  context,
  list
}) => resolvedData;
```

### `validateInput`

Executed after `resolveInput`. Should throw if `resolvedData` is invalid.

#### Usage

<!-- prettier-ignore -->
```javascript
const validateInput = ({
  resolvedData,
  existingItem,
  originalInput,
  addFieldValidationError,
  context,
  list,
}) => {
  /* throw any errors here */
};
```

_Note_: `validateInput` is not executed for deleted items. See: [`validateDelete`](#validate-delete)

### `beforeChange`

Executed after `validateInput`. `beforeChange` is not used to manipulate data but can be used to preform actions before data is saved.

_Note_: `beforeChange` is not executed for deleted items. See: [`beforeDelete`](#before-delete)

### `afterChange`

Executed once the mutation has been completed and all transactions finalised.

#### Usage

<!-- prettier-ignore -->
```javascript
const afterChange = ({
  updatedItem,
  existingItem,
  originalInput,
  context,
  list
}) => {
  /* side effects here */
};
```

_Note_: `afterChange` is not executed for deleted items. See: [`afterDelete`](#after-delete)

### `validateDelete`

Executed after access control checks. Should throw if delete operation is invalid.

#### Usage

<!-- prettier-ignore -->
```javascript
const validateDelete = ({
  existingItem,
  addFieldValidationError,
  context,
  list,
}) => {
  /* throw any errors here */
};
```

### `beforeDelete`

Executed after `validateDelete`.

#### Usage

<!-- prettier-ignore -->
```javascript
const beforeDelete = ({
  existingItem,
  context,
  list,
}) => {
  /* throw any errors here */
};
```

### `afterDelete`

Executed once the delete mutation has been completed and all transactions finalised.

#### Usage

<!-- prettier-ignore -->
```javascript
const afterDelete = ({
  existingItem,
  context,
  list,
}) => {
  /* side effects here */
};
```

---

## Hooks function properties

| Parameter                 | Type             | Description                                                                                                                    |
| ------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `resolvedData`            | `Object`         | An object containing data received by the graphQL mutation and defaults values.                                                |
| `existingItem`            | `any`            | The current stored value. (`undefined` for create)                                                                             |
| `originalInput`           | `Object`         | An object containing arguments passed to the field in the graphQL query.                                                       |
| `context`                 | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/essentials/data.html#context) for this request. |
| `list`                    | `Object`         | An Object providing access to List functions. [List properties](#List-properties).                                             |
| `addFieldValidationError` | `Function`       | Used to set a field validation error. Accepts a `String`.                                                                      |

### List properties

The `list` property contain an object providing access to List functions:

```javascript
{
  /**
   * @param args Object The same arguments as the *WhereUniqueInput graphql
   * type
   * @param context Object The Apollo context object for this request
   * @param options.skipAccessControl Boolean By default access control _of
   * the user making the initial request_ is still tested. Disable all
   * Access Control checks with this flag
   *
   * @return Promise<Object> The found item
   */
  query: (args, context, options) => Promise<Object>,

  /**
   * @param args Object The same arguments as the *WhereInput graphql type
   * @param context Object The Apollo context object for this request
   * @param options.skipAccessControl Boolean By default access control _of
   * the user making the initial request_ is still tested. Disable all
   * Access Control checks with this flag
   *
   * @return Promise<[Object]|[]> The found item. May reject with Access
   * Control errors.
   */
  queryMany: (args, context, options) => Promise<Object|null>,

  /**
   * @param args Object The same arguments as the *WhereInput graphql type
   * @param context Object The Apollo context object for this request
   * @param options.skipAccessControl Boolean By default access control _of
   * the user making the initial request_ is still tested. Disable all
   * Access Control checks with this flag
   *
   * @return Promise<Object> Meta data about the found items. Currently
   * contains only a single key: `count`.
   */
  queryManyMeta: (args, context, options) => Promise<Object>,

  /**
   * @param key String The string name of a Keystone list
   * @return Object The programatic API of the requested list.
   */
  getList: (key) => Object,
}
```
