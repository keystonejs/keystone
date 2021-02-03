<!--[meta]
section: api
subSection: field-types
title: File
[meta]-->

# File

Support files hosted in a range of different contexts, e.g. in the local filesystem, or on a cloud based file server.

## Usage

```js
const { File } = require('@keystonejs/fields');
const { LocalFileAdapter } = require('@keystonejs/file-adapters');

const fileAdapter = new LocalFileAdapter({
  /*...config */
});

keystone.createList('Applicant', {
  fields: {
    file: {
      type: File,
      adapter: fileAdapter,
      isRequired: true,
    },
  },
});
```

### Config

| Option       | Type      | Default  | Description                                                                             |
| ------------ | --------- | -------- | --------------------------------------------------------------------------------------- |
| `adapter`    | `Object`  | Required | See the [File Adapters](/packages/file-adapters/README.md) page for available adapters. |
| `isRequired` | `Boolean` | `false`  | Does this field require a value?                                                        |
