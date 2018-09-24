# Keystone Field Types

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

Currently, it just includes the `Field` view, which is the form control rendered
in the **Item Details** view in the Admin UI.

In the future this will be extended to include views for the Cell in the Items
List, the Filter UI, and possibly more.
