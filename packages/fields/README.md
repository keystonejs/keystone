---
section: field-types
title: Introduction
---

# Field Types

What makes up a Field Type:

```
Type/index.js           -- The field definition, points to other files and defines the type
Type/Controller.js      -- Client-side controller for the field type
Type/Implementation.js  -- Back-end implementation of the field type
Type/README.md          -- Type specific documentation and usage examples
Type/views/
  Field.js              -- Main React component rendered by the Item Details view
  Cell.js               -- Main React component rendered by the List view
```

## Controller

This is the client-side class that implements helpers for the Admin UI React app
and views.

It should extend the `./Controller.js` in the package root.

It is generally responsible for getting the default data for new items,
processing raw data returned by the API, implementing client-side validation
methods, and other helper utilities.

## Implementation

This is the back-end class that implements the field type and its schema in
Keystone. It implements the GraphQL schema types, custom argument definitions
and resolvers, as well as Field Config and Admin Meta management.

Back-end logic for value validation, processing and hooks should be implemented
here.

## Views

These are the client-side React Components that render various pieces of UI for
the field type.

There are currently three views that can be provided:

- `Field` - the form control rendered in the **Item Details** view
- `Cell` - the content rendered in the List view
- `Filter` - the filter control rendered in the filters dropdown in the List view

```jsx
type FilterProps<Value> = {
  innerRef: React.Ref<*>,
  value: Value,
  onChange: Value => mixed,
  field: Field,
  filter: *,
};

type CellProps<Value> = {
  list: List,
  field: Field,
  data: Value,
  Link: React.ComponentType<{ children: React.Node, id: string, path: string }>,
};

type FieldProps<Value> = {
  autoFocus: boolean,
  field: Field,
  value: Value,
  error: Error,
  onChange: Value => mixed,
  renderContext: 'dialog' | 'page',
};
```
