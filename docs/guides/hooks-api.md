---
section: guides
title: Hooks API
---

# Hooks API

The APIs for each hook are mostly the same across the 3 hook types
([list hooks](../hooks#list-hooks), [field hooks](../hooks#field-hooks), [field type
hooks](../hooks#field-type-hooks)).
Any differences are called out in the documentation for that hook below.

Usage:

```javascript
keystone.createList('User', {
  fields: {
    name: {
      type: Text
      hooks: {
        resolveInput: async (...) => { ... },
        validateInput: async (...) => { ... },
        beforeChange: async (...) => { ... },
        afterChange: async (...) => { ... },
        beforeDelete: async (...) => { ... },
        validateDelete: async (...) => { ... },
        afterDelete: async (...) => { ... },
      },
    },
  },
  hooks: {
    resolveInput: async (...) => { ... },
    validateInput: async (...) => { ... },
    beforeChange: async (...) => { ... },
    afterChange: async (...) => { ... },
    beforeDelete: async (...) => { ... },
    validateDelete: async (...) => { ... },
    afterDelete: async (...) => { ... },
  },
  ...
});
```

## `resolveInput: Func(ResolveInputArg: Object) => ResolveInputResult: Object|Promise<Object>`

Example:

<!-- prettier-ignore -->
```javascript
const resolveInput = ({
  resolvedData,
  existingItem,
  originalInput,
  context,
  list,
}) => resolvedData;
```

### `ResolveInputArg: Object`

```
{
  resolvedData: Object,
  existingItem: Object,
  originalInput: Object,
  context: Object,
  list: Object,
}
```

#### `ResolveInputArg#resolvedData`

An object containing the data received by the graphQL mutation and any defaults
provided by the field types.

Roughly:

```javascript
{
  ...fieldDefaults,
  ...inputData,
}
```

#### `ResolveInputArg#existingItem`

For `create` mutations, this will be `undefined`.

For `update` mutations, this will be the current value as stored in the
database.

#### `ResolveInputArg#originalInput`

An object with the arguments passed into the field in the query.
For example, if the field was called with `user(name: "Ada")`,
the `data` object would be: `{ 'name': 'Ada' }`.

#### `ResolveInputArg#context`

The [Apollo `context`
object](https://www.apollographql.com/docs/apollo-server/essentials/data.html#context)
for this request.

#### `ResolveInputArg#list`

An API providing programatic access to List functions:

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

### `ResolveInputResult: Object|Promise<Object>`

The result of `resolveInput()` should have the same structure as the input (ie;
the same keys). It is passed to [the next function in the execution
order](../hooks.md#hook-excecution-order) as the input data.

---

## `validateInput: Func(ValidateInputArg: Object) => undefined`

Example:

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

### `ValidateInputArg: Object`

```
{
  resolvedData: Object,
  existingItem: Object,
  originalInput: Object,
  addFieldValidationError: Func,
  context: Object,
  list: Object,
}
```

```DOCS_TODO
TODO
```

---

## `validateDelete: Func(ValidateDeleteArg: Object) => undefined|Promise<undefined>`

Example:

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

### `ValidateDeleteArg: Object`

```
{
  existingItem: Object,
  addFieldValidationError: Func,
  context: Object,
  list: Object,
}
```

```DOCS_TODO
TODO
```

---

## `beforeChange: Func(BeforeChangeArg: Object) => undefined|Promise<undefined>`

Example:

<!-- prettier-ignore -->
```javascript
const beforeChange = ({
  resolvedData,
  existingItem,
  originalInput,
  context,
  list,
}) => {
  /* side effects here */
};
```

### `BeforeChangeArg: Object`

```
{
  resolvedData: Object,
  existingItem: Object,
  originalInput: Object,
  context: Object,
  list: Object,
}
```

```DOCS_TODO
TODO
```

---

## `afterChange: Func(AfterChangeArg: Object) => undefined|Promise<undefined>`

Example:

<!-- prettier-ignore -->
```javascript
const afterChange = ({
  updatedItem,
  existingItem,
  originalInput,
  context,
  list,
}) => {
  /* side effects here */
};
```

### `ValidateDeleteArg: Object`

```
{
  updatedItem: Object,
  existingItem: Object,
  originalInput: Func,
  context: Object,
  list: Object,
}
```

```DOCS_TODO
TODO
```

---

## `beforeDelete: Func(BeforeDeleteArg: Object) => undefined|Promise<undefined>`

Example:

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

### `BeforeDeleteArg: Object`

```
{
  existingItem: Object,
  context: Object,
  list: Object,
}
```

```DOCS_TODO
TODO
```

---

## `afterDelete: Func(AfterDeleteArg: Object) => undefined|Promise<undefined>`

Example:

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

### `AfterDeleteArg: Object`

```
{
  existingItem: Object,
  context: Object,
  list: Object,
}
```

```DOCS_TODO
TODO
```
