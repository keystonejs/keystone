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

| Option       | Type      | Default  | Description                                                                                            |
| ------------ | --------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `adapter`    | `Object`  | Required | See the [File Adapters](https://www.keystonejs.com/keystone/file-adapters/) page for more information. |
| `route`      | `String`  | `null`   |                                                                                                        |
| `isRequired` | `Boolean` | `false`  | Does this field require a value?                                                                       |

_Note:_ `adapter` currently may be one of `LocalFileAdapter` or `CloudinaryFileAdapter`.
