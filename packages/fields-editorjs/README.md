<!--[meta]
section: api
subSection: field-types
title: EditorJs
[meta]-->

# EditorJS

This field inserts a string path into your schema based on the `Text` field type implementation, and renders a Block based editor in the Admin UI powered by [EditorJS](https://editorjs.io/)

## Usage

This package isn't included with the keystone fields package and needs to be installed with `yarn add @keystonejs/fields-editorjs` or `npm install @keystonejs/fields-editorjs`

Then import it, and use it like any other field:

```js
const { EditorJs } = require('@keystonejs/fields-editorjs');
```

## Config

### `editorConfig`

**Default:** `{}`

**TODO**
- [ ] tools configuration needs to be passed on to editorjs instance.
- [ ] image upload backend and adapter