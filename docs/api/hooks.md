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

Note: For performance reasons relationship fields are not fully resolved by hooks, and will return an array of ids. To fetch data from a relationship field, a second query is required. To do this inside a hook function use the `context.executeGraphQL()` method.

## Hook types

Hooks can be categorised into four [types](/docs/guides/hooks.md#hook-type)
depending on where in the list schema they're attached:

- [List hooks](#list-hooks)
- [Field hooks](#field-hooks)
- [Field type hooks](#field-type-hooks)
- [Authentication hooks](#authentication-hooks)

With the exception of the authentication hooks, the [hook sets](/docs/guides/hooks.md#hook-set) that span these types have very similar signatures.
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

### Authentication hooks

Authentication hooks can be defined by the system developer by specifying the `hooks` attribute when calling `createAuthStrategy()`.
Hooks for the `authenticate` and `unauthenticate` operations are available.

#### Usage

```js
keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  hooks: {
    resolveAuthInput: async (...) => {...},
    validateAuthInput: async (...) => {...},
    beforeAuth: async (...) => {...},
    afterAuth: async (...) => {...},

    beforeUnauth: async (...) => {...},
    afterUnauth: async (...) => {...},
  },
});
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
| `listKey`       | `String`                | The key for the list being operated on                                                                                       |
| `fieldPath`     | `String`                | The path for the field being operated on (applicable to field hooks only)                                                    |

#### Usage

<!-- prettier-ignore -->

```js
const resolveInput = ({
  operation,
  existingItem,
  originalInput,
  resolvedData,
  context,
  listKey,
  fieldPath, // exists only for field hooks
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
| `listKey`                 | `String`                | The key for the list being operated on                                                                                       |
| `fieldPath`               | `String`                | The path for the field being operated on (applicable to field hooks only)                                                    |

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
  listKey,
  fieldPath, // exists only for field hooks
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
| `listKey`       | `String`                | The key for the list being operated on                                                                                       |
| `fieldPath`     | `String`                | The path for the field being operated on (applicable to field hooks only)                                                    |

#### Usage

<!-- prettier-ignore -->

```js
const beforeChange = ({
  operation,
  existingItem,
  originalInput,
  resolvedData,
  context,
  listKey,
  fieldPath, // exists only for field hooks
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
| `listKey`       | `String`                | The key for the list being operated on                                                                                       |
| `fieldPath`     | `String`                | The path for the field being operated on (applicable to field hooks only)                                                    |

#### Usage

<!-- prettier-ignore -->

```js
const afterChange = ({
  operation,
  existingItem,
  originalInput,
  updatedItem,
  context,
  listKey,
  fieldPath, // exists only for field hooks
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
| `listKey`                 | `String`         | The key for the list being operated on                                                                                       |
| `fieldPath`               | `String`         | The path for the field being operated on (applicable to field hooks only)                                                    |

#### Usage

<!-- prettier-ignore -->

```js
const validateDelete = ({
  operation,
  existingItem,
  context,
  addFieldValidationError,
  listKey,
  fieldPath, // exists only for field hooks
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
| `listKey`      | `String`         | The key for the list being operated on                                                                                       |
| `fieldPath`    | `String`         | The path for the field being operated on (applicable to field hooks only)                                                    |

#### Usage

<!-- prettier-ignore -->

```js
const beforeDelete = ({
  operation,
  existingItem,
  context,
  listKey,
  fieldPath, // exists only for field hooks
}) => {
  // Perform side effects
  // Return values ignored
};
```

### `afterDelete`

**Used to cause side effects after the delete operation is executed.**

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
| `listKey`      | `String`         | The key for the list being operated on                                                                                       |
| `fieldPath`    | `String`         | The path for the field being operated on (applicable to field hooks only)                                                    |

#### Usage

<!-- prettier-ignore -->

```js
const afterDelete = ({
  operation,
  existingItem,
  context,
  listKey,
  fieldPath, // exists only for field hooks
}) => {
  // Perform side effects
  // Return values ignored
};
```

### `resolveAuthInput`

**Used to modify the `originalInput`, producing `resolvedData`.**

- Invoked after access control is applied
- Available for `authenticate` operations

The return of `resolveAuthInput` can be a `Promise` or an `Object`.
It should resolve to the same structure as `originalInput`.
The result is passed to [the next function in the execution order](/docs/guides/hooks.md#intra-hook-execution-order).

#### Arguments

| Argument        | Type             | Description                                                                                                                   |
| :-------------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `operation`     | `String`         | The operation being performed (`authenticate` in this case)                                                                   |
| `originalInput` | `Object`         | The data received by the GraphQL mutation                                                                                     |
| `context`       | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/essentials/data.html#context) for this request |
| `listKey`       | `String`         | The key for the list being operated on                                                                                        |

#### Usage

<!-- prettier-ignore -->

```js
const resolveAuthInput = ({
  operation,
  originalInput,
  context,
  listKey,
}) => {
  // Input resolution logic
  // Object returned is used in place of resolvedData
  return resolvedData;
};
```

### `validateAuthInput`

**Used to verify the `resolvedData` is valid.**

- Invoked after the `resolveAuthInput` hook has resolved
- Available for `authenticate` operations

If errors are found in `resolvedData` the function should either throw or call the supplied `addValidationError` argument.
Return values are ignored.

#### Arguments

| Argument             | Type             | Description                                                                                                                   |
| :------------------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `operation`          | `String`         | The operation being performed (`authenticate` in this case)                                                                   |
| `originalInput`      | `Object`         | The data received by the GraphQL mutation                                                                                     |
| `resolvedData`       | `Object`         | The data received by the GraphQL mutation or returned by `resolveAuthInput`, if defined                                       |
| `context`            | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/essentials/data.html#context) for this request |
| `addValidationError` | `Function`       | Used to set a validation error; accepts a message `String`                                                                    |
| `listKey`            | `String`         | The key for the list being operated on                                                                                        |

#### Usage

<!-- prettier-ignore -->

```js
const validateAuthInput = ({
  operation,
  originalInput,
  resolvedData,
  context,
  addFieldValidationError,
  listKey,
}) => {
  // Throw error objects or register validation errors with addValidationError(<String>)
  // Return values ignored
};
```

### `beforeAuth`

**Used to cause side effects before the authenticate operation is executed.**

- Invoked after the `validateAuthInput` hook has resolved
- Available for `authenticate` operations

`beforeAuth` hooks can perform operations before the auth strategy `validate()` function is invoked.
Return values are ignored.

#### Arguments

| Argument        | Type             | Description                                                                                                                   |
| :-------------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `operation`     | `String`         | The operation being performed (`authenticate` in this case)                                                                   |
| `originalInput` | `Object`         | The data received by the GraphQL mutation                                                                                     |
| `resolvedData`  | `Object`         | The data received by the GraphQL mutation or returned by `resolveAuthInput`, if defined                                       |
| `context`       | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/essentials/data.html#context) for this request |
| `listKey`       | `String`         | The key for the list being operated on                                                                                        |

#### Usage

<!-- prettier-ignore -->

```js
const beforeAuth = ({
  operation,
  originalInput,
  resolvedData,
  context,
  listKey,
}) => {
  // Perform side effects
  // Return values ignored
};
```

### `afterAuth`

**Used to cause side effects after the authenticate operation is executed.**

- Invoked after the authenticate operation has completed
- Available for `authenticate` operations

Can cause side effects after the credentials have been validated or rejected.
If authentication was successful, the function is passed the item being authenticated.

Return values are ignored.

#### Arguments

| Argument        | Type             | Description                                                                                                                   |
| :-------------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `operation`     | `String`         | The operation being performed (`authenticate` in this case)                                                                   |
| `item`          | `Object`         | The item the caller has successfully authenticated as                                                                         |
| `success`       | `Boolean`        | Indicates whether the credentials were verified successfully                                                                  |
| `message`       | `String`         | The message being returned to caller                                                                                          |
| `token`         | `String`         | The session token generated                                                                                                   |
| `originalInput` | `Object`         | The data received by the GraphQL mutation                                                                                     |
| `resolvedData`  | `Object`         | The data received by the GraphQL mutation or returned by `resolveAuthInput`, if defined                                       |
| `context`       | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/essentials/data.html#context) for this request |
| `listKey`       | `String`         | The key for the list being operated on                                                                                        |

#### Usage

<!-- prettier-ignore -->

```js
const afterAuth = ({
  operation,
  item,
  success,
  message,
  token,
  originalInput,
  resolvedData,
  context,
  listKey,
}) => {
  // Perform side effects
  // Return values ignored
};
```

### `beforeUnauth`

**Used to cause side effects before the unauthenticate operation is executed.**

- Invoked after access control is applied
- Available for `unauthenticate` operations

`beforeUnauth` hooks can perform operations before the `context.endAuthedSession()` function is invoked.
Return values are ignored.

#### Arguments

| Argument    | Type             | Description                                                                                                                   |
| :---------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `operation` | `String`         | The operation being performed (`authenticate` in this case)                                                                   |
| `context`   | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/essentials/data.html#context) for this request |
| `listKey`   | `String`         | The key for the list being operated on                                                                                        |

#### Usage

<!-- prettier-ignore -->

```js
const beforeUnauth = ({
  operation,
  context,
  listKey,
}) => {
  // Perform side effects
  // Return values ignored
};
```

### `afterUnauth`

**Used to cause side effects after the unauthenticate operation is executed.**

- Invoked after the unauthenticate operation has completed
- Available for `unauthenticate` operations

Can cause side effects after the user session has been ended.
If a user session was terminated, the `listKey` and `itemId` of the user are passed to the function.

Return values are ignored.

#### Arguments

| Argument    | Type             | Description                                                                                                                   |
| :---------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `operation` | `String`         | The operation being performed (`authenticate` in this case)                                                                   |
| `success`   | `Boolean`        | Indicates whether the unauthentication operation was successful                                                               |
| `listKey`   | `String`         | The list key of the unauthenticated user (if there was one)                                                                   |
| `itemid`    | `String`         | The item ID of the unauthenticated user (if there was one)                                                                    |
| `context`   | `Apollo Context` | The [Apollo `context` object](https://www.apollographql.com/docs/apollo-server/essentials/data.html#context) for this request |
| `listKey`   | `String`         | The key for the list being operated on                                                                                        |

#### Usage

<!-- prettier-ignore -->

```js
const afterAuth = ({
  operation,
  item,
  success,
  message,
  token,
  originalInput,
  resolvedData,
  context,
  listKey,
}) => {
  // Perform side effects
  // Return values ignored
};
```

---

### Running GraphQL Queries From Hook

If you need to execute a GraphQL query from within your hook function you can use `context.executeGraphQL()`.
See the docs on [server-side graphql operations](/docs/discussions/server-side-graphql.md) for more details.
