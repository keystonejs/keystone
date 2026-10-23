---
title: "Custom Fields"
description: "Learn how to expand Keystone with your own custom fields. Guidance on backend setup, and frontend implementation in Keystone‘s Admin UI."
---

Keystone provides a collection of [field types](../fields/overview) which you can use to build your system.
If you need a field type which isn't provided, or you need a specialised version of an existing field type, you can define your own custom field type.

There are two parts to a field type:

- The **backend** portion which defines what data is stored in the database and how it appears in the GraphQL API.
- The **frontend** portion which defines how the field looks and behaves in the Admin UI.

The general approach to creating a custom field type is to take an existing field type and make the appropriate changes for your use case.
In this guide we're going to create a field type `myInt` which recreates the [`integer`](https://github.com/keystonejs/keystone/tree/main/packages/core/src/fields/types/integer) field type.

{% hint kind="tip" %}
For inspiration, see [the source for the fields that Keystone provides](https://github.com/keystonejs/keystone/tree/main/packages/core/src/fields/types) and the [Custom Fields](https://github.com/keystonejs/keystone/tree/main/examples/custom-field) example project.
{% /hint %}

## Backend

The backend portion is the entry point to the field type.
We define our field type `myInt` and the corresponding type `MyIntFieldConfig` which defines the accepted configuration options.

```ts
import {
  BaseListTypeInfo,
  FieldTypeFunc,
  CommonFieldConfig,
  fieldType,
  orderDirectionEnum,
} from '@keystone-6/core/types'
import { g } from '@keystone-6/core'

export type MyIntFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique'
  }

export function myInt <ListTypeInfo extends BaseListTypeInfo>({
  isIndexed,
  ...config
}: MyIntFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  return meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Int',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
    })({
      ...config,
      input: {
        create: { arg: g.arg({ type: g.Int }) },
        update: { arg: g.arg({ type: g.Int }) },
        orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
      },
      output: g.field({ type: g.Int }),
      views: './view',
    })
}
```

### DB Field

`fieldType` is called with the _db field_ which defines what the field should store in the database.
Here it's an integer (`scalar: 'Int'`) but there are other kinds which you can find in [the type definitions for `DBField`](https://github.com/keystonejs/keystone/blob/main/packages/core/src/types/next-fields.ts).

### Inputs

The `input` object defines the GraphQL inputs for the field type.

```ts
input: {
  create: { arg: g.arg({ type: g.Int }) },
  update: { arg: g.arg({ type: g.Int }) },
  orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
},
```

You can also provide resolvers to transform the value coming from GraphQL into the value that is passed to Prisma.

```ts
input: {
  create: { arg: g.arg({ type: g.Int }), resolve: (val, context) => val },
  update: { arg: g.arg({ type: g.Int }), resolve: (val, context) => val },
  orderBy: { arg: g.arg({ type: orderDirectionEnum }), resolve: (val, context) => val },
},
```

#### Omitted inputs and partial updates

A field's create or update input resolver is called even when the mutation omits that field.
On update, an omitted field is passed to its input resolver as `undefined`.
For scalar fields, return `undefined` to leave the stored value unchanged.
Check for omission before applying normalization or fallback values, otherwise an unrelated update can overwrite existing data.

For example, a custom nullable string field can trim supplied values while preserving omission and explicit clearing:

```ts
input: {
  update: {
    arg: g.arg({ type: g.String }),
    resolve(value) {
      if (value === undefined) return undefined
      if (value === null) return null
      return value.trim()
    },
  },
},
```

`null` is an explicit input; whether it clears a field or is rejected depends on the field's resolver and validation.
Likewise, `false`, `0`, `''`, and `[]` are supplied values, not omission.
Avoid truthiness checks such as `if (!value)` when deciding whether to leave a field unchanged.
Create defaults should be handled separately from update omission.

For a multi-column field, return each unchanged column as `undefined`.
Keystone's resolver types require every column key, including keys for columns that are not being changed.
For example, a field with two nullable string columns can handle omission, clearing, and partial input as follows:

```ts
function resolveInput(
  value: { left?: string | null; right?: string | null } | null | undefined
) {
  if (value === undefined) return { left: undefined, right: undefined }
  if (value === null) return { left: null, right: null }
  return { left: value.left, right: value.right }
}
```

Returning a no-op value from an input resolver does not prevent a later hook from deliberately changing that field.
See [detecting supplied inputs in hooks](../config/hooks#detecting-supplied-inputs) for the distinction between original input and resolved values.

### Output

The output field defines what can be fetched from the field:

```ts
output: g.field({ type: g.Int })
```

A resolver can also be provided:

```ts
output: g.field({
  type: g.Int,
  resolve({ value, item }, args, context, info) {
    return value
  }
})
```

## Frontend

The frontend portion of a field must be in a seperate file that the backend implementation points to with the `views` option.

The `views` option is resolved as though it is an import from some file in the project directory.

```
views: './view',
```

#### Controller

The `controller` export defines the functional parts of the frontend of a field.

```tsx
// view.tsx

export const controller = (config: FieldControllerConfig): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: data => {
      const value = data[config.path]
      return typeof value === 'number' ? value + '' : ''
    },
    serialize: value => ({ [config.path]: value === '' ? null : parseInt(value, 10) }),
  }
}
```

### Field

The `Field` export is a React component which is used in the **item view** and the **create modal** that allows users to view and edit the value of the field.

```tsx
// view.tsx

import { TextField } from '@keystar/ui/text-field'

export function Field ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) {
  const disabled = onChange === undefined

  return (
    <TextField
      autoFocus={autoFocus}
      description={field.description}
      label={field.label}
      isDisabled={disabled}
      onChange={x => onChange?.(x === '' ? null : x)}
      value={value ?? ''}
    />
  )
}
```

### Cell

The `Cell` export is an optional custom React component for formatting the field value as shown in the table on the **list view**.
This component does not allow modifying the value.

```tsx
// view.tsx

import { CellLink, CellContainer } from '@keystone-6/core/admin-ui/components'
import { CellComponent } from '@keystone-6/core/types'

export const Cell: CellComponent<typeof controller> = ({ value }) => {
  return <CellContainer>{value}</CellContainer>
}
```

## Related resources

{% related-content %}
{% well
heading="Example Project: Custom Fields"
href="https://github.com/keystonejs/keystone/tree/main/examples/custom-field"
target="_blank" %}
Adds a custom field type based on the `integer` field type which lets users rate items on a 5-star scale. Builds on the Blog starter project.
{% /well %}
{% /related-content %}
