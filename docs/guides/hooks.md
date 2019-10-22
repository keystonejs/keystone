<!--[meta]
section: guides
title: Hooks
[meta]-->

# Hooks

> _NOTE: Below is an overview of hooks. For API docs see
> [Hooks API](/api/hooks)._

KeystoneJS provide a system of hooks on the `create`, `update`, and `delete` mutations which allow developers to customise the behaviour of their system.

There are 7 hooks available to use, which can be grouped into pre- and post-hooks depending on whether they get invoked before or after the database update operation.

- Pre-hooks
  - `resolveInput`
  - `validateInput`/`validateDelete`
  - `beforeChange`/`beforeDelete`
- Post-hooks
  - `afterChange`/`afterDelete`

## Hook Types

For each of these hooks, there are three _types_ of hook which can be defined.

- [List hooks](#list-hooks)
- [Field hooks](#field-hooks)
- [Field Type hooks](#field-type-hooks)

### List hooks

List hooks can be defined by the system developer by specifying the `hooks` attribute of a list configuration when calling `createList()`.

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

### Field hooks

Field hooks can be defined by the system developer by specifying the `hooks` attribute of a field configuration when calling `createList()`.

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

### Field Type hooks

Field Type hooks are associated with a particular _Field Type_ and are applied to all fields of that type.
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

## Hook Execution Order

The hooks are invoked in a specific order during a mutation operation.

### Create/Update

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

### Intra-hook Execution Order

Within each hook, the different hook types are invoked in a specific order.

1. All relevant [`Field Type hooks`](#field-type-hooks) are invoked in parallel.
2. then, All relevant [`Field hooks`](#field-hooks) are invoked in parallel.
3. then, The [`List hook`](#list-hooks) is invoked.

Which [Field](#field-hooks) & [Field Type](#field-type-hooks) hooks are executed depend on the following flow:

- `resolveInput`: Called on all fields, even if they are not defined in the supplied data.
- `validateInput`: Called on all fields which have a resolved value after the `resolveInput` hook has run.
- `beforeChange`: Called on all fields which have a resolved value after the `resolveInput` hook has run.
- `afterChange`: Called on all fields, even if their value was not changed.
- `validateDelete`: Called on all fields.
- `beforeDelete`: Call on all fields.
- `afterDelete`: Called on all fields.

<!-- TODO: ## Error Handling -->
