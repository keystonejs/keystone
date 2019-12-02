<!--[meta]
section: api
title: Hooks
order: 7
[meta]-->

# Hooks

The APIs for each hook are mostly the same across the 3 hook types
([list hooks](/guides/hooks#list-hooks), [field hooks](/guides/hooks#field-hooks), [field type
hooks](/guides/hooks#field-type-hooks)).

Any differences are called out in the documentation below.

## Usage

```js
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

```js
const resolveInput = ({
  resolvedData,
  existingItem,
  originalInput,
  context,
  actions,
  operation,
}) => resolvedData;
```

### `validateInput`

Executed after `resolveInput`. Should throw if `resolvedData` is invalid.

#### Usage

<!-- prettier-ignore -->

```js
const validateInput = ({
  resolvedData,
  existingItem,
  originalInput,
  addFieldValidationError,
  context,
  actions,
  operation,
}) => {
  /* throw any errors here */
};
```

_Note_: `validateInput` is not executed for deleted items. See: [`validateDelete`](#validate-delete)

### `beforeChange`

Executed after `validateInput`. `beforeChange` is not used to manipulate data but can be used to preform actions before data is saved.

#### Usage

<!-- prettier-ignore -->

```js
const beforeChange = ({
  resolvedData,
  existingItem,
  context,
  originalInput,
  actions,
  operation,
}) => {
  /* side effects here */
};
```

_Note_: `beforeChange` is not executed for deleted items. See: [`beforeDelete`](#before-delete)

### `afterChange`

Executed once the mutation has been completed and all transactions finalised.

#### Usage

<!-- prettier-ignore -->

```js
const afterChange = ({
  updatedItem,
  existingItem,
  originalInput,
  context,
  actions,
  operation,
}) => {
  /* side effects here */
};
```

_Note_: `afterChange` is not executed for deleted items. See: [`afterDelete`](#after-delete)

### `validateDelete`

Executed after access control checks. Should throw if delete operation is invalid.

#### Usage

<!-- prettier-ignore -->

```js
const validateDelete = ({
  existingItem,
  addFieldValidationError,
  context,
  actions,
  operation,
}) => {
  /* throw any errors here */
};
```

### `beforeDelete`

Executed after `validateDelete`.

#### Usage

<!-- prettier-ignore -->

```js
const beforeDelete = ({
  existingItem,
  context,
  actions,
  operation,
}) => {
  /* throw any errors here */
};
```

### `afterDelete`

Executed once the delete mutation has been completed and all transactions finalised.

#### Usage

<!-- prettier-ignore -->

```js
const afterDelete = ({
  existingItem,
  context,
  actions,
  operation,
}) => {
  /* side effects here */
};
```

---

## Hook Function Arguments

| Argument                  | Type             | Description                                                                                                                    |
| ------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `resolvedData`            | `Object`         | An object containing data received by the graphQL mutation and defaults values.                                                |
| `existingItem`            | `any`            | The current stored value. (`undefined` for create)                                                                             |
| `originalInput`           | `Object`         | An object containing arguments passed to the field in the graphQL query.                                                       |
| `context`                 | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/essentials/data.html#context) for this request. |
| `addFieldValidationError` | `Function`       | Used to set a field validation error. Accepts a `String`.                                                                      |
| `actions`                 | `Object`         | An Object providing access to List functions, see [`actions` Argument](#actions-argument).                                     |
| `operation`               | `String`         | A key indicating the current operation being performed, ie. `'create'`, `'update'` or `'delete'`.                              |

### `actions` Argument

The `actions` argument is an object containing a query helper:

```js
{
  /**
   * @param queryString String A graphQL query string
   * @param options.skipAccessControl Boolean By default access control _of
   * the user making the initial request_ is still tested. Disable all
   * Access Control checks with this flag
   * @param options.variables Object The variables passed to the graphql
   * query for the given queryString.
   *
   * @return Promise<Object> The graphql query response
   */
  query: (queryString, options, options) => Promise({ errors, data }),
}
```
