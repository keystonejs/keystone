<!--[meta]
section: api
subSection: field-adapters
title: File Adapters
[meta]-->

# File Adapters

The `File` field type can support files hosted in a range of different contexts, e.g. in the local filesystem, or on a cloud based file server.

Different contexts are supported by different file adapters. This package contains the built-in file adapters supported by KeystoneJS.

## `LocalFileAdapter`

### Usage

```javascript
const { LocalFileAdapter } = require('@keystonejs/file-adapters');

const fileAdapter = new LocalFileAdapter({
  /*...config */
});
```

### Config

| Option | Type     | Default | Description                                                            |
| ------ | -------- | ------- | ---------------------------------------------------------------------- |
| `src`  | `String` | `null`  | The path where uploaded files will be stored on the server.            |
| `path` | `String` | `null`  | The path from which requests for files will be served from the server. |

_Note:_ `src` and `path` may be the same.

## `CloudinaryFileAdapter`

```javascript
const { CloudinaryAdapter } = require('@keystonejs/file-adapters');

const fileAdapter = new CloudinaryAdapter({
  /*...config */
});
```

| Option      | Type     | Default     | Description |
| ----------- | -------- | ----------- | ----------- |
| `cloudName` | `String` | Required    |             |
| `apiKey`    | `String` | Required    |             |
| `apiSecret` | `String` | Required    |             |
| `folder`    | `String` | `undefined` |             |
