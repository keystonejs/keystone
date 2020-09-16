<!--[meta]
section: api
subSection: field-types
title: Content
[meta]-->

# Content

A Block-based Content Field for composing rich text such as blog posts, wikis,
and even complete pages.

The `Content` field type can accept an optional array of _Blocks_ which enhance
the editing experience of that field in various ways. Built on top of Slate.js,
_Blocks_ are a powerful tool for creating structured and unstructured content
editing flows.

## Usage

This package isn't included with the keystone fields package and needs to be installed with `yarn add @keystonejs/fields-content` or `npm install @keystonejs/fields-content`.

```javascript
const { Content } = require('@keystonejs/fields-content');

keystone.createList('Post', {
  fields: {
    body: {
      type: Content,
      blocks: [
        Content.blocks.blockquote,
        Content.blocks.image,
        Content.blocks.link,
        Content.blocks.orderedList,
        Content.blocks.unorderedList,
        Content.blocks.heading,
      ],
    },
  },
});
```

## API

Each block is defined by the following API:

```javascript
{
  // (required)
  // A globally unique name for this block. Alpha-num characters only.
  // NOTE: This must match the value exported from `getAdminViews()#type`.
  type: 'MyBlock',

  // (required)
  // The views this block will provide.
  // See below for the expected exports.
  // Blocks can insert/render other blocks (eg; an image gallery can insert
  // an image block). These other block views should also be included here.
  getAdminViews: () => ['/absolute/path/to/built/view/file'],

  // (optional)
  // The server-side serialization implementation logic.
  // If not provided, any data included in the block will be serialised and
  // stored as a string in the database, and passed directly back to the
  // slate.js editor client side.
  // NOTE: See getAdminViews()#serialiser for complimentary client-side logic
  implementation: SingleImageBlock,

  // TODO: The client-side serialization implementation logic.
}
```

The view files referenced from the `getAdminViews()` option can have the
following exports:

```javascript
// (required)
// A globally unique name for this block. Alpha-num characters only.
// NOTE: This must match the value exported from the Block config .type
export const type = 'MyBlock';

// (required)
// The element rendered into the slate.js editor.
// Is passed all the props a slate.js `renderNode()` receives.
export const Node = /* ... */;

// (optional)
// A button / element to insert into the side bar when it's opened.
// Will be passed a single prop; `editor` which is an instance of the Slate.js
// editor.
export const Sidebar = /* ... */;

// (optional)
// The individual button which shows in the toolbar
export const ToolbarElement = /* ... */;

// (optional)
// Toolbar overwrite. Useful if clicking the button needs to show more info.
// Will be rendered within the toolbar, and passed {children} which is the
// regular toolbar. It can opt to not render the {children} so the entire
// toolbar is replaced with this element.
export const Toolbar = /* ... */;

// (optional)
// Wraps the entire Content Editor. The value is the options object passed to
// the block from the field config.
// TODO: Can we skip this and instead pass the options into each of the above
// views directly?
export const Provider = /* ... */;

// (optional)
// slate.js schema object, injected into the slate.js schema as:
// {
//   document: { /* .. */ },
//   blocks: {
//     [type]: <here>,
//   },
// }
export const schema = /* ... */;

// (optional)
// slate.js plugins array.
export const plugins = /* ... */;

// (optional)
//
export function processNodeForConnectQuery({ id, node }) { return { node, query } };
```

## Custom blocks

In addition to the standard set of blocks exposed by the `Content` field, you can create custom blocks using the above API.
Some other field types also expose custom blocks that can be used in the `Content` field. You can find examples of custom blocks in the following fields:

- [CloudinaryImage field](/packages/fields-cloudinary-image/README.md).
- [oEmbed field](/packages/fields-oembed/README.md).
- [Unsplash field](/packages/fields-unsplash/README.md).
