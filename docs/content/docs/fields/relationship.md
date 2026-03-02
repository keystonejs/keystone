---
title: "Relationship"
description: "A reference of Keystone's relationship field type, configuration and options."
---

A `relationship` field represents a relationship between two lists.

Read our [relationships guide](../guides/relationships) for details on Keystone’s relationship model and how to configure them in your project.

- `ref` (required): A string of the form `<listKey>` or `<listKey>.<fieldKey>`.
- `many` (default: `false`): Configures the cardinality of the relationship.
- `db.foreignKey`: When `true` or an object, ensures the foreign Key for two-sided relationships is stored in the table for this list (only available on single relationships, and not on both sides of a 1-to-1 relationship)
  - `map`: Changes the column name in the database
- `ui`: Configures the display mode of the field in the Admin UI
  - `displayMode` (default: `select`): Controls how the relationship is displayed in the Admin UI. Options: `'select'`, `'cards'`, `'count'`, or `'table'`.
    - `'count'` and `'table'` only support `many: true` relationships (`'count'` will require `itemView: { fieldMode: 'read' }` to be set)
    - `'table'` displays related items in a tabular format.
  - `labelField`: The field path from the related list to use for item labels in the select. Defaults to the `labelField` configured on the related list.
  - `searchFields`: The fields used by the Admin UI when searching by this relationship on the list view and in relationship fields. Nominated fields need to support the `contains` filter. Defaults to `ui.listView.searchField` on the related list.
  - `filter`: A where input filter to apply when showing items in the select. Defaults to the `ui.listView.initialFilter` (if set) on the related list.
  - `sort`: The sort to apply when showing items in the select, e.g. `{ field: 'name', direction: 'ASC' }`. Defaults to the `ui.listView.initialSort` (if set) on the related list.
  - `hideCreate` (default: `false`). If `true`, the "Create related item" button is not shown in the item view.

```typescript
import { config, list } from '@keystone-6/core';
import { relationship } from '@keystone-6/core/fields';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: relationship({
          ref: '...',
          many: false,
          db: {
            foreignKey: {
              map: 'foreign_id',
            },
          },
          ui: {
            hideCreate: false,
            displayMode: 'select',
            labelField: 'name',
            displayMode: 'cards',
            cardFields: [...],
            linkToItem: true,
            removeMode: 'disconnect',
            inlineCreate: { fields: [...] },
            inlineEdit: { fields: [...] },
            inlineConnect: true,
            // Display mode: 'count'
            // requires many: true above
            displayMode: 'count',
           },
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```

## GraphQL

For to-many relationships (`many: true`), the update input type includes `connect`, `disconnect`, and `set` fields:

- `connect`: Nominate an item to relate to this item.
- `disconnect`: Disconnect any relationships to this item.
- `set`: Replace the set of related items (disconnects, then connects the nominated items).
