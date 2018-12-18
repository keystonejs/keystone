# Hooks

- [Hook APIs](#hook-apis)
- [Hook Excecution Order](#hook-excecution-order)
  - [Create/Delete](#createdelete)
  - [Delete](#delete)
- [Intra-hook Execution Order](#intra-hook-execution-order)
- [Error Handling](#error-handling)

Keystone provide a system of hooks on the `create`, `update`, and `delete` mutations which allow developers to customise the behaviour of their system.

There are 7 hooks available to use, which can be grouped into pre- and post-hooks depending on whether they get invoked before or after the database update operation.

- Pre-hooks
  - `resolveInput`
  - `validateInput`/`validateDelete`
  - `beforeChange`/`beforeDelete`
- Post-hooks
  - `afterChange`/`afterDelete`

For each of these hooks, there are three _types_ of hook which can be defined.

- Field type hooks
- Custom field hooks
- Custom list hooks

`Field type hooks` are associated with a particular _Field Type_ and are applied to all fields of that type.
Custom field types can implement hooks by implementing the following hook methods on the `Field` base class.

```js
class CustomFieldType extends Field {
  async resolveInput(...) { ... }
  async validateInput(...) { ... }
  async beforeChange(...) { ... }
  async afterChange(...) { ... }
  async beforeDelete(...) { ... }
  async validateDelete(...) { ... }
  async afterDelete(...) { ... }
}
```

`Custom field hooks` can be defined by the system developer by specifying the `hooks` attribute of a field configuration at `List` creation time.

```js
keystone.createList('User', {
  fields: {
    name: {
      type: Text,
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
    },
    ...
  },
  ...
});
```

`Custom list hooks` can be defined by the system developer by specifying the `hooks` attribute of a list configuration at `List` creation time.

```js
keystone.createList('User', {
  fields: {
    name: { type: Text },
    ...
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

## Hook APIs

```js
resolveInput({ resolvedData, existingItem, context, adapter, originalInput });
validateInput({
  resolvedData,
  existingItem,
  context,
  adapter,
  originalInput,
  addFieldValidationError,
});
beforeChange({ resolvedData, existingItem, context, adapter, originalInput });
afterChange({ updatedItem, originalInput, existingItem, context, adapter });
beforeDelete({ existingItem, context, adapter });
validateDelete({ existingItem, context, adapter, addFieldValidationError });
afterDelete({ existingItem, context, adapter });
```

- `resolveData`
- `existingItem`
- `updatedItem`
- `originalInput`
- `context`
- `adapter`
- `addFieldValidationError`

## Hook Excecution Order

The hooks are invoked in a specific order during a mutation operation.

### Create/Delete

1. `resolveInput`
2. `validateInput`
3. `beforeChange`
4. Database operation
5. `afterChange`

### Delete

1. `validateDelete`
2. `beforeDelete`
3. Database operation
4. `afterDelete`

For full details of the mutation lifecycle, and where hooks fit within this, please see [here].

## Intra-hook Execution Order

Within each hook, the different hook types are invoked in a specific order.

1. All relevant `field type hooks` are invoked in parallel.
2. All relevant `custom field hooks` are invoked in parallel.
3. The `custom list hook` is invoked.

The field hooks (field type hooks and custom field hooks) are only invoked on the relevant fields for the given mutation.

- `resolveInput`: Called on all fields, even if they are not defined in the supplied data.
- `validateInput`: Called on all fields which have a resolved value after the `resolveInput` hook has run.
- `beforeChange`: Called on all fields which have a resolved value after the `resolveInput` hook has run.
- `afterChange`: Called on all fields, even if their value was not changed.
- `validateDelete`: Called on all fields.
- `beforeDelete`: Call on all fields.
- `afterDelete`: Called on all fields.

## Error Handling
