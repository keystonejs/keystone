# Hooks API

The APIs for each hook are mostly the same across the 3 hook types
([list hooks](#list-hooks), [field hooks](#field-hooks), [field type
hooks](#field-type-hooks)).
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

```javascript
const resolveInput = ({ resolvedData, existingItem, originalInput, context, adapter }) => resolvedData;
```

### `ResolveInputArg: Object`

```
{
  resolvedData: Object,
  existingItem: Object,
  originalInput: Object,
  context: Object,
  adapter: Object,
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

#### `ResolveInputArg#adapter`

The current Lists's internal Keystone Adapter, providing access to the
underlying Keystone API and model.

### `ResolveInputResult: Object|Promise<Object>`

The result of `resolveInput()` should have the same structure as the input (ie;
the same keys). It is passed to [the next function in the execution
order]('./hooks.md#hook-excecution-order) as the input data.

---

## `validateInput: Func(ValidateInputArg: Object) => undefined`

Example:

```javascript
const validateInput = ({ resolvedData, existingItem, originalInput, addFieldValidationError, context, adapter }) => { /* throw any errors here */ }
```

### `ValidateInputArg: Object`

```
{
  resolvedData: Object,
  existingItem: Object,
  originalInput: Object,
  addFieldValidationError: Func,
  context: Object,
  adapter: Object,
}
```

> TODO: docs

---

## `validateDelete: Func(ValidateDeleteArg: Object) => undefined|Promise<undefined>`

Example:

```javascript
const validateDelete = ({ existingItem, addFieldValidationError, context, adapter }) => { /* throw any errors here */ }
```

### `ValidateDeleteArg: Object`

```
{
  existingItem: Object,
  addFieldValidationError: Func,
  context: Object,
  adapter: Object,
}
```

> TODO: docs

---

## `beforeChange: Func(BeforeChangeArg: Object) => undefined|Promise<undefined>`

Example:

```javascript
const beforeChange = ({ resolvedData, existingItem, originalInput, context, adapter }) => { /* side effects here */ }
```

### `BeforeChangeArg: Object`

```
{
  resolvedData: Object,
  existingItem: Object,
  originalInput: Object,
  context: Object,
  adapter: Object,
}
```

> TODO: docs

---

## `afterChange: Func(AfterChangeArg: Object) => undefined|Promise<undefined>`

Example:

```javascript
const afterChange = ({ updatedItem, existingItem, originalInput, context, adapter }) => { /* side effects here */ }
```

### `ValidateDeleteArg: Object`

```
{
  updatedItem: Object,
  existingItem: Object,
  originalInput: Func,
  context: Object,
  adapter: Object,
}
```

> TODO: docs

---

## `beforeDelete: Func(BeforeDeleteArg: Object) => undefined|Promise<undefined>`

Example:

```javascript
const beforeDelete = ({ existingItem, context, adapter }) => { /* throw any errors here */ }
```

### `BeforeDeleteArg: Object`

```
{
  existingItem: Object,
  context: Object,
  adapter: Object,
}
```

> TODO: docs

---

## `afterDelete: Func(AfterDeleteArg: Object) => undefined|Promise<undefined>`

Example:

```javascript
const afterDelete = ({ existingItem, context, adapter }) => { /* side effects here */ }
```

### `AfterDeleteArg: Object`

```
{
  existingItem: Object,
  context: Object,
  adapter: Object,
}
```

> TODO: docs
