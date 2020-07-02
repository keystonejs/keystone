<!--[meta]
section: api
title: Hooks
order: 7
[meta]-->

# Hooks API

Hooks give solution developers a way to add custom logic to the framework of lists, fields and operations Keystone provides.

This document describes:

- How and where to configure hooks of different types
- The specific arguments and usage information of different hook sets

For a more general overview of the concepts, patterns and function of the Keystone hook system, see the
[hooks guide](/docs/guides/hooks.md).

Note: For performance reasons relationships fields are not fully resolved by hooks, and will return an array of ids. To fetch data from a relationship field, a second query is required. To do this inside a hook function use the `context.executeGraphQL()` method.

## Hook types

Hooks can be categories into three [types](/docs/guides/hooks.md#hook-type)
depending on where in the list schema they're attached:

- [List hooks](#list-hooks)
- [Field hooks](#field-hooks)
- [Field type hooks](#field-type-hooks)

The [hook sets](/docs/guides/hooks.md#hook-set) that span these types have very similar signatures.
Any differences are called out in the documentation below.

### List hooks

List hooks can be defined by the system developer by specifying the `hooks` attribute of a list configuration when calling `createList()`.
Hooks for the `create`, `update` and `delete` operations are available.

#### Usage

```js
keystone.createList('User', {
  fields: {
    name: { type: Text },
  },
  hooks: {
    // Hooks for create and update operations
    resolveInput: async (...) => {...},
    validateInput: async (...) => {...},
    beforeChange: async (...) => {...},
    afterChange: async (...) => {...},

    // Hooks for delete operations
    validateDelete: async (...) => {...},
    beforeDelete: async (...) => {...},
    afterDelete: async (...) => {...},
  },
});
```

### Field hooks

Field hooks can be defined by the system developer by specifying the `hooks` attribute of a field configuration when calling `createList()`.
Hooks for the `create`, `update` and `delete` operations are available.

#### Usage

```js
keystone.createList('User', {
  fields: {
    name: {
      type: Text,
      hooks: {
        // Hooks for create and update operations
        resolveInput: async (...) => {...}
        validateInput: async (...) => {...}
        beforeChange: async (...) => {...}
        afterChange: async (...) => {...}

        // Hooks for delete operations
        validateDelete: async (...) => {...}
        beforeDelete: async (...) => {...}
        afterDelete: async (...) => {...}
      },
    },
  },
});
```

### Field type hooks

Field type hooks are associated with a particular _field type_ and are applied to all fields of that type.
Custom field types can implement hooks by implementing the following hook methods on the `Field` base class.
See the [Custom Field Types guide](/docs/guides/custom-field-types.md) for more info.

Hooks for the `create`, `update` and `delete` operations are available.

#### Usage

```js
class CustomFieldType extends Field {
  // Hooks for create and update operations
  async resolveInput(...) {...},
  async validateInput(...) {...},
  async beforeChange(...) {...},
  async afterChange(...) {...},

  // Hooks for delete operations
  async beforeDelete(...) {...},
  async validateDelete(...) {...},
  async afterDelete(...) {...},
}
```

## Hook sets

### `resolveInput`

**Used to modify the `resolvedData`.**

- Invoked after access control and field defaults are applied
- Available for `create` and `update` operations

The return of `resolveInput` can be a `Promise` or an `Object`.
It should resolve to the same structure as the `resolvedData`.
The result is passed to [the next function in the execution order](/docs/guides/hooks.md#execution-order).

#### Arguments

| Argument        | Type                    | Description                                                                                                                  |
| :-------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `operation`     | `String`                | The operation being performed (ie. `create` or `update`)                                                                     |
| `existingItem`  | `Object` or `undefined` | The current stored item (or `undefined` for `create` operations)                                                             |
| `originalInput` | `Object`                | The data received by the GraphQL mutation                                                                                    |
| `resolvedData`  | `Object`                | The data received by the GraphQL mutation plus defaults values                                                               |
| `context`       | `Apollo Context`        | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/data/data/#context-argument) for this request |

#### Usage

<!-- prettier-ignore -->

```js
const resolveInput = ({
  operation,
  existingItem,
  originalInput,
  resolvedData,
  context,
}) => {
  // Input resolution logic. Object returned is used in place of `resolvedData`.
  return resolvedData;
};
```

### `validateInput`

**Used to verify the `resolvedData` is valid.**

- Invoked after all `resolveInput` hooks have resolved
- Available for `create` and `update` operations

If errors are found in `resolvedData` the function should either throw or call the supplied `addFieldValidationError` argument.
Return values are ignored.

#### Arguments

| Argument                  | Type                    | Description                                                                                                                  |
| :------------------------ | :---------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `operation`               | `String`                | The operation being performed (ie. `create` or `update`)                                                                     |
| `existingItem`            | `Object` or `undefined` | The current stored item (or `undefined` for `create` operations)                                                             |
| `originalInput`           | `Object`                | The data received by the GraphQL mutation                                                                                    |
| `resolvedData`            | `Object`                | The data received by the GraphQL mutation plus defaults values                                                               |
| `context`                 | `Apollo Context`        | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/data/data/#context-argument) for this request |
| `addFieldValidationError` | `Function`              | Used to set a field validation error; accepts a `String`                                                                     |

#### Usage

<!-- prettier-ignore -->

```js
const validateInput = ({
  operation,
  existingItem,
  originalInput,
  resolvedData,
  context,
  addFieldValidationError,
}) => {
  // Throw error objects or register validation errors with addFieldValidationError(<String>)
  // Return values ignored
};
```

### `beforeChange`

**Used to cause side effects before the primary operation is executed.**

- Invoked after all `validateInput` hooks have resolved
- Available for `create` and `update` operations

`beforeChange` hooks can't manipulate the data passed to the primary operation but perform operations before data is saved.
Return values are ignored.

#### Arguments

| Argument        | Type                    | Description                                                                                                                  |
| :-------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `operation`     | `String`                | The operation being performed (ie. `create` or `update`)                                                                     |
| `existingItem`  | `Object` or `undefined` | The current stored item (or `undefined` for `create` operations)                                                             |
| `originalInput` | `Object`                | The data received by the GraphQL mutation                                                                                    |
| `resolvedData`  | `Object`                | The data received by the GraphQL mutation plus defaults values                                                               |
| `context`       | `Apollo Context`        | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/data/data/#context-argument) for this request |

#### Usage

<!-- prettier-ignore -->

```js
const beforeChange = ({
  operation,
  existingItem,
  originalInput,
  resolvedData,
  context,
}) => {
  // Perform side effects
  // Return values ignored
};
```

### `afterChange`

**Used to cause side effects after the primary operation is executed.**

- Invoked after the primary operation has completed
- Available for `create` and `update` operations

`afterChange` hooks perform actions after data is saved.
It receives both the "pre-update" item that was stored (`existingItem`) and the resultant, "post-update" item data (`updatedItem`).
This includes any DB-level defaults.
Notably, for `create` operations, this includes the item's `id`.

Return values are ignored.

#### Arguments

| Argument        | Type                    | Description                                                                                                                  |
| :-------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `operation`     | `String`                | The operation being performed (ie. `create` or `update`)                                                                     |
| `existingItem`  | `Object` or `undefined` | The previously stored item (or `undefined` for `create` operations)                                                          |
| `originalInput` | `Object`                | The data received by the GraphQL mutation                                                                                    |
| `updatedItem`   | `Object`                | The new/currently stored item                                                                                                |
| `context`       | `Apollo Context`        | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/data/data/#context-argument) for this request |

#### Usage

<!-- prettier-ignore -->

```js
const afterChange = ({
  operation,
  existingItem,
  originalInput,
  updatedItem,
  context,
}) => {
  // Perform side effects
  // Return values ignored
};
```

### `validateDelete`

**Used to verify a delete operation is valid**, ie. will maintain data consitency.

- Invoked after access control has been tested
- Available for `delete` operations

Should throw or register errors with `addFieldValidationError(<String>)` if the delete operation is invalid.

#### Arguments

| Argument                  | Type             | Description                                                                                                                  |
| :------------------------ | :--------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `operation`               | `String`         | The operation being performed (`delete` in this case)                                                                        |
| `existingItem`            | `Object`         | The current stored item                                                                                                      |
| `context`                 | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/data/data/#context-argument) for this request |
| `addFieldValidationError` | `Function`       | Used to set a field validation error; accepts a `String`                                                                     |

#### Usage

<!-- prettier-ignore -->

```js
const validateDelete = ({
  operation,
  existingItem,
  context,
  addFieldValidationError,
}) => {
  // Throw error objects or register validation errors with addFieldValidationError(<String>)
  // Return values ignored
};
```

### `beforeDelete`

**Used to cause side effects before the delete operation is executed.**

- Invoked after all `validateDelete` hooks have resolved
- Available for `delete` operations

Perform actions before the delete operation is executed.
Return values are ignored.

#### Arguments

| Argument       | Type             | Description                                                                                                                  |
| :------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `operation`    | `String`         | The operation being performed (`delete` in this case)                                                                        |
| `existingItem` | `Object`         | The current stored item                                                                                                      |
| `context`      | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/data/data/#context-argument) for this request |

#### Usage

<!-- prettier-ignore -->

```js
const beforeDelete = ({
  operation,
  existingItem,
  context,
}) => {
  // Perform side effects
  // Return values ignored
};
```

### `afterDelete`

**Used to cause side effects before the delete operation is executed.**

- Invoked after the delete operation has been executed
- Available for `delete` operations

Perform actions after the delete operation has been executed.
This is the last chance to operate on the previously stored item, supplied as `existingItem`.

Return values are ignored.

#### Arguments

| Argument       | Type             | Description                                                                                                                  |
| :------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `operation`    | `String`         | The operation being performed (`delete` in this case)                                                                        |
| `existingItem` | `Object`         | The previously stored item, now deleted                                                                                      |
| `context`      | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/data/data/#context-argument) for this request |

#### Usage

<!-- prettier-ignore -->

```js
const afterDelete = ({
  operation,
  existingItem,
  context,
}) => {
  // Perform side effects
  // Return values ignored
};
```

### Running GraphQL Queries From Hook

If you need to execute a GraphQL query from within your hook function you can use `context.executeGraphQL()`.
See the docs on [server-side graphql operations](/docs/discussions/server-side-graphql.md) for more details.
