---
title: "Relationship"
description: "A reference of Keystone's relationship field type, configuration and options."
---

A `relationship` field represents a relationship between two lists.

Read our [relationships guide](../guides/relationships) for details on Keystone’s relationship model and how to configure them in your project.

- `ref` (required): A string of the form `<listKey>` or `<listKey>.<fieldKey>`.
- `many` (default: `false`): Configures the cardinality of the relationship.
- `db.foreignKey`: When `true` or an object, ensures the foreign Key for two-sided relationships is stored in the table for this list (only available on single relationships, and not on both sides of a 1:1 relationship)
  - `map`: Changes the column name in the database
- `ui` (default: `{ hideCreate: false, displayMode: 'select' }`): Configures the display mode of the field in the Admin UI.
  - `hideCreate` (default: `false`). If `true`, the "Create related item" button is not shown in the item view.
  - `displayMode` (default: `'select'`): Controls the mode used to display the field in the item view. The mode `'select'` displays related items in a select component, while `'cards'` displays the related items in a card layout. Each display mode supports further configuration.
- `ui.displayMode === 'select'` options:
  - `labelField`: The field path from the related list to use for item labels in the select. Defaults to the `labelField` configured on the related list.
- `searchFields`: The fields used by the UI to search for this item, in context of this relationship field. Defaults to `searchFields` configured on the related list.
- `ui.displayMode === 'cards'` options:
  - `cardFields`: A list of field paths from the related list to render in the card component. Defaults to `'id'` and the `labelField` configured on the related list.
  - `linkToItem` (default `false`): If `true`, the default card component will render as a link to navigate to the related item.
  - `removeMode` (default: `'disconnect'`): Controls whether the `Remove` button is present in the card. If `'disconnect'`, the button will be present. If `'none'`, the button will not be present.
  - `inlineCreate` (default: `null`): If not `null`, an object of the form `{ fields: [...] }`, where `fields` is a list of field paths from the related list should be provided. An inline `Create` button will be included in the cards allowing a new related item to be created based on the configured field paths.
  - `inlineEdit` (default: `null`): If not `null`, an object of the form `{ fields: [...] }`, where `fields` is a list of field paths from the related list should be provided. An `Edit` button will be included in each card, allowing the configured fields to be edited for each related item.
  - `inlineConnect` (default: `false`): If `true`, an inline `Link existing item` button will be present, allowing existing items of the related list to be connected in this field.
Alternatively this can be an object with the properties:
	- `labelField`: The field path from the related list to use for item labels in select. Defaults to the `labelField` configured on the related list.
	- `searchFields`: The fields used by the UI to search for this item, in context of this relationship field. Defaults to `searchFields` configured on the related list.
- `ui.displayMode === 'count'` only supports `many` relationships

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
