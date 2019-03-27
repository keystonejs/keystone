---
section: field-types
title: Wysiwyg
---

# WYSIWYG HTML Field powered by TinyMCE Editor

This field inserts a string path into your schema based on the `Text` field type implementation, and renders a WYSIWYG editor in the Admin UI using [TinyMCE](https://www.tiny.cloud/)

## Usage

In addition to using this field type in a List, for it to work in the Admin UI you'll need to serve the TinyMCE assets from your webserver.

The Field includes a function that sets up the middleware for you. Configure it in your webserver like this:

```js
const keystone = require('@keystone-alpha/core');
const WysiwygField = require('@keystone-alpha/fields-wysiwyg-tinymce');

keystone.prepare().then(async ({ server }) => {
  WysiwygField.bindStaticMiddleware(server);
  await server.start();
});
```

### Why do we need static middleware?

TinyMCE needs to be able to load files from its package at runtime to support per-project or per-field customisation of toolbars and plugins. Unfortunately with TinyMCE v5's architecture this is too complex to vendor automatically with webpack, so the simplest solution is to serve the contents of the package using static middleware in express.

The `bindStaticMiddleware` method automatically detects the file location of the package and serves its content at the path that TinyMCE is configured to expect.

```DOCS_TODO
TODO
```

## Credit

The `Editor` implementation was inspired by the [tinymce-react](https://github.com/tinymce/tinymce-react) Official TinyMCE React component, Copyright 2017-present Ephox, Inc.
