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

| Option        | Type        | Default        | Description                                                                                                 |
| ------------- | ----------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `src`         | `String`    | Required       | The path where uploaded files will be stored on the server.                                                 |
| `path`        | `String`    | Value of `src` | The path from which requests for files will be served from the server.                                      |
| `getFilename` | `functions` | `null`         | Function taking a `{ id, originalFilename }` parameter. Should return a name for the uploaded file on disk. |

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

## `S3FileAdapter`

```javascript
const { S3Adapter } = require('@keystonejs/file-adapters');

const fileAdapter = new S3Adapter({
  accessKeyId: 'ACCESS_KEY_ID',
  secretAccessKey: 'SECRET_ACCESS_KEY',
  region: 'us-west-2',
  bucket: 'bucket-name',
  folder: '/cat-photos',
  publicUrl: ({ id, filename, _meta }) => `https://{CF_DISTRIBUTION_ID}.cloudfront.net/cat-photos/${filename}`,
  s3Options: {
    apiVersion: '2006-03-01'
  },
  uploadParams: ({ filename, id, mimetype, encoding }) => ({
    Metadata: {
      "db_id": id
    }
  }
});
```

| Option             | Type              | Default     | Description |
| ------------------ | ----------------- | ----------- | ----------- |
| `accessKeyId`      | `String`          | Required    | AWS access key ID |
| `secretAccessKey`  | `String`          | Required    | AWS secret access key |
| `region`           | `String`          | Required    | AWS region |
| `bucket`           | `String`          | Required    | S3 bucket name |
| `folder`           | `String`          | Required    | Upload folder from root of bucket |
| `publicUrl`        | `Function`        |             | By default the publicUrl returns a url for the S3 bucket in the form `https://{bucket}.s3.amazonaws.com/{key}/{filename}`. This will only work if the bucket is configured to allow public access. |
| `s3Options`        | `Object`          | `undefined` | For available options refer to the [AWS S3 API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html) |
| `uploadParams`     | `Object|Function` | `undefined` | A configuration object or function returning configuration object to be passed with each S3 upload. For available options refer to the [AWS S3 putObject API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property). |
