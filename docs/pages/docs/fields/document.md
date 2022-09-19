---
title: "Document"
description: "A reference of Keystone's document field type, configuration and options."
---

A highly customizable, [Slate](https://docs.slatejs.org/)-based, rich text editor that lets content creators quickly and easily edit content in your system.
See the [Document Field guide](https://keystonejs.com/docs/guides/document-fields),
[demo](https://keystonejs.com/docs/guides/document-field-demo) and
[example project](https://github.com/keystonejs/keystone/tree/main/examples/document-field) for details.

Options:

- `relationships`
- `componentBlocks`
- `formatting`
- `links`
- `dividers`
- `layouts`

```typescript
import { config, list } from '@keystone-6/core';
import { document } from '@keystone-6/fields-document';

export default config({
  lists: {
    SomeListName: list({
      fields: {
        someFieldName: document({
          relationships: { /* ... */ },
          componentBlocks: {
            block: { /* ... */ },
            /* ... */
          },
          formatting: { /* ... */ },
          links: true,
          dividers: true,
          layouts: [/* ... */],
        }),
        /* ... */
      },
    }),
    /* ... */
  },
  /* ... */
});
```
