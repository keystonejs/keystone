<!--[meta]
section: api
subSection: field-types
title: Wysiwyg
[meta]-->

# WYSIWYG

This field inserts a string path into your schema based on the `Text` field type implementation, and renders a WYSIWYG editor in the Admin UI using [TinyMCE](https://www.tiny.cloud/)

## Usage

This package isn't included with the keystone fields package and needs to be installed with `yarn add @keystonejs/fields-wysiwyg-tinymce` or `npm install @keystonejs/fields-wysiwyg-tinymce`

Then import it, and use it like any other field:

```js
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce');
```

## Credit

The `Editor` implementation was inspired by the [tinymce-react](https://github.com/tinymce/tinymce-react) Official TinyMCE React component, Copyright 2017-present Ephox, Inc.
