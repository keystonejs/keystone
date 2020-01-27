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

| Option        | Type       | Default        | Description                                                                                                                 |
| ------------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src`         | `String`   | Required       | The path where uploaded files will be stored on the server.                                                                 |
| `path`        | `String`   | Value of `src` | The path from which requests for files will be served from the server.                                                      |
| `getFilename` | `Function` | `null`         | Function taking a `{ id, originalFilename }` parameter. Should return a string with the name for the uploaded file on disk. |

_Note:_ `src` and `path` may be the same.

### Methods

### `delete`

Takes an object with a `file` key representing the filename and deletes that file on disk. This can be combined with hooks to implement delete-on-file-change and delete-on-list-delete functionality:

```js
const { File } = require('@keystonejs/fields');

const fileAdapter = new LocalFileAdapter({
  src: './files',
  path: '/files',
});

keystone.createList('UploadTest', {
  fields: {
    file: {
      type: File,
      adapter: fileAdapter,
      hooks: {
        beforeChange: ({ existingItem = {} }) => fileAdapter.delete(existingItem),
      },
    },
  },
  hooks: {
    afterDelete: ({ existingItem = {} }) => fileAdapter.delete(existingItem),
  },
});
```

## `CloudinaryFileAdapter`

### Usage

```javascript
const { CloudinaryAdapter } = require('@keystonejs/file-adapters');

const fileAdapter = new CloudinaryAdapter({
  /*...config */
});
```

### Config

| Option      | Type     | Default     | Description |
| ----------- | -------- | ----------- | ----------- |
| `cloudName` | `String` | Required    |             |
| `apiKey`    | `String` | Required    |             |
| `apiSecret` | `String` | Required    |             |
| `folder`    | `String` | `undefined` |             |

### Methods

### `delete`

Takes an object with an `id` key representing the public file ID and deletes that file on the server.

## `S3FileAdapter`

```javascript
const { S3Adapter } = require('@keystonejs/file-adapters');

const CF_DISTRIBUTION_ID = 'cloudfront-distribution-id';
const S3_PATH = 'uploads';

const fileAdapter = new S3Adapter({
  accessKeyId: 'ACCESS_KEY_ID',
  secretAccessKey: 'SECRET_ACCESS_KEY',
  region: 'us-west-2',
  bucket: 'bucket-name',
  folder: S3_PATH,
  publicUrl: ({ id, filename, _meta }) =>
    `https://${CF_DISTRIBUTION_ID}.cloudfront.net/${S3_PATH}/${filename}`,
  s3Options: {
    apiVersion: '2006-03-01',
  },
  uploadParams: ({ filename, id, mimetype, encoding }) => ({
    Metadata: {
      keystone_id: id,
    },
  }),
});
```

| Option            | Type              | Default     | Description                                                                                                                                                                                                                              |
| ----------------- | ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accessKeyId`     | `String`          | Required    | AWS access key ID                                                                                                                                                                                                                        |
| `secretAccessKey` | `String`          | Required    | AWS secret access key                                                                                                                                                                                                                    |
| `region`          | `String`          | Required    | AWS region                                                                                                                                                                                                                               |
| `bucket`          | `String`          | Required    | S3 bucket name                                                                                                                                                                                                                           |
| `folder`          | `String`          | Required    | Upload folder from root of bucket                                                                                                                                                                                                        |
| `getFilename`     | `Function`        | `null`      | Function taking a `{ id, originalFilename }` parameter. Should return a string with the name for the uploaded file on disk.                                                                                                              |
| `publicUrl`       | `Function`        |             | By default the publicUrl returns a url for the S3 bucket in the form `https://{bucket}.s3.amazonaws.com/{key}/{filename}`. This will only work if the bucket is configured to allow public access.                                       |
| `s3Options`       | `Object`          | `undefined` | For available options refer to the [AWS S3 API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)                                                                                                                         |
| `uploadParams`    | `Object|Function` | `{}`        | A config object or function returning a config object to be passed with each call to S3.upload. For available options refer to the [AWS S3 upload API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property). |

### Methods

### `delete`

Deletes the provided file in the S3 bucket. Takes a `file` object (such as the one returned in file field hooks) and an optional `options` argument for overriding S3.deleteObject options. Options `Bucket` and `Key` are set by default. For available options refer to the [AWS S3 deleteObject API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property).

```javascript
const deleteParams = {
  BypassGovernanceRetention: true,
};

keystone.createList('Document', {
  fields: {
    file: {
      type: File,
      adapter: fileAdapter,
      hooks: {
        beforeChange: ({ existingItem }) => {
          if (existingItem && existingItem.file) {
            fileAdapter.delete(existingItem.file, deleteParams);
          }
        },
      },
    },
  },
  hooks: {
    afterDelete: ({ existingItem }) => {
      if (existingItem.file) {
        fileAdapter.delete(existingItem.file, deleteParams);
      }
    },
  },
});
```
