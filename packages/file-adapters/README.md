<!--[meta]
section: api
subSection: field-adapters
title: File adapters
[meta]-->

# File adapters

The `File` field type can support files hosted in a range of different contexts, e.g. in the local filesystem, or on a cloud based file server.

Different contexts are supported by different file adapters. This package contains the built-in file adapters supported by KeystoneJS.

## `LocalFileAdapter`

### Usage

```javascript
const { LocalFileAdapter } = require('@keystonejs/file-adapters');

const fileAdapter = new LocalFileAdapter({...});
```

### Config

| Option        | Type       | Default        | Description                                                                                                                 |
| ------------- | ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src`         | `String`   | Required       | The path where uploaded files will be stored on the server.                                                                 |
| `path`        | `String`   | Value of `src` | The path from which requests for files will be served from the server.                                                      |
| `getFilename` | `Function` | `null`         | Function taking a `{ id, originalFilename }` parameter. Should return a string with the name for the uploaded file on disk. |

> **Note:** `src` and `path` may be the same.
> **Note 2:** You will need to set also a [static file server](https://v5.keystonejs.com/keystonejs/app-static/#static-file-app) to consume the uploaded files.

### Methods

#### `delete`

Takes a `file` object (such as the one returned in file field hooks) and deletes that file from disk.

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
        beforeChange: async ({ existingItem }) => {
          if (existingItem && existingItem.file) {
            await fileAdapter.delete(existingItem.file);
          }
        },
      },
    },
  },
  hooks: {
    afterDelete: async ({ existingItem }) => {
      if (existingItem.file) {
        await fileAdapter.delete(existingItem.file);
      }
    },
  },
});
```

## `CloudinaryFileAdapter`

### Usage

```javascript
const { CloudinaryAdapter } = require('@keystonejs/file-adapters');

const fileAdapter = new CloudinaryAdapter({...});
```

### Config

| Option      | Type     | Default     | Description |
| ----------- | -------- | ----------- | ----------- |
| `cloudName` | `String` | Required    |             |
| `apiKey`    | `String` | Required    |             |
| `apiSecret` | `String` | Required    |             |
| `folder`    | `String` | `undefined` |             |

### Methods

#### `delete`

Deletes the provided file from cloudinary. Takes a `file` object (such as the one returned in file field hooks) and an optional `options` argument passed to the Cloudinary destroy method. For available options refer to the [Cloudinary destroy API](https://cloudinary.com/documentation/image_upload_api_reference#destroy_method).

## `S3FileAdapter`

### Usage

```javascript
const { S3Adapter } = require('@keystonejs/file-adapters');

const CF_DISTRIBUTION_ID = 'cloudfront-distribution-id';
const S3_PATH = 'uploads';

const fileAdapter = new S3Adapter({
  bucket: 'bucket-name',
  folder: S3_PATH,
  publicUrl: ({ id, filename, _meta }) =>
    `https://${CF_DISTRIBUTION_ID}.cloudfront.net/${S3_PATH}/${filename}`,
  s3Options: {
    // Optional paramaters to be supplied directly to AWS.S3 constructor
    apiVersion: '2006-03-01',
    accessKeyId: 'ACCESS_KEY_ID',
    secretAccessKey: 'SECRET_ACCESS_KEY',
    region: 'us-west-2',
  },
  uploadParams: ({ filename, id, mimetype, encoding }) => ({
    Metadata: {
      keystone_id: `${id}`,
    },
  }),
});
```

### Config

| Option         | Type                   | Default     | Description                                                                                                                                                                                                                              |
| -------------- | ---------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bucket`       | `String`               | Required    | S3 bucket name                                                                                                                                                                                                                           |
| `folder`       | `String`               | `''`        | Upload folder from root of bucket. By default uploads will be sent to the bucket's root folder.                                                                                                                                          |
| `getFilename`  | `Function`             | `null`      | Function taking a `{ id, originalFilename }` parameter. Should return a string with the name for the uploaded file on disk.                                                                                                              |
| `publicUrl`    | `Function`             |             | By default the publicUrl returns a url for the S3 bucket in the form `https://{bucket}.s3.amazonaws.com/{key}/{filename}`. This will only work if the bucket is configured to allow public access.                                       |
| `s3Options`    | `Object`               | `undefined` | For available options refer to the [AWS S3 API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)                                                                                                                         |
| `uploadParams` | `Object    | Function` | `{}`        | A config object or function returning a config object to be passed with each call to S3.upload. For available options refer to the [AWS S3 upload API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property). |

> **Note:** Authentication can be done in many different ways. One option is to include valid `accessKeyId` and `secretAccessKey` properties in the `s3Options` parameter. Other methods include setting environment variables. See [Setting Credentials in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html) for a complete set of options.

### S3-compatible object storage providers

You can also use any S3 compatible object storage provider with this adapter. You must provide the config `s3Options.endpoint` to correctly point to provider's server. Other options may be required based on which provider you choose.

- [DigitalOcean Spaces](https://www.digitalocean.com/docs/spaces/resources/s3-sdk-examples/)

```js
const s3Options = {
  accessKeyId: 'YOUR-ACCESSKEYID',
  secretAccessKey: 'YOUR-SECRETACCESSKEY',
  endpoint: 'https://${REGION}.digitaloceanspaces.com', // REGION is datacenter region e.g. nyc3, sgp1 etc
};
```

- [Minio](https://docs.minio.io/docs/how-to-use-aws-sdk-for-javascript-with-minio-server.html)

```js
const s3Options = {
  accessKeyId: 'YOUR-ACCESSKEYID',
  secretAccessKey: 'YOUR-SECRETACCESSKEY',
  endpoint: 'http://127.0.0.1:9000', // locally or cloud url
  s3ForcePathStyle: true, // needed with minio?
  signatureVersion: 'v4', // needed with minio?
};
```

> For Minio `ACL: 'public-read'` config on `uploadParams.Metadata` option does not work compared to AWS or DigitalOcean, you must set `public` policy on bucket to use anonymous access, if you want to provide authenticated access, you must use `afterChange` hook to populate publicUrl. Check [`policy`](https://docs.minio.io/docs/minio-client-complete-guide.html) command in Minio client

### Methods

#### `delete`

Deletes the provided file in the S3 bucket. Takes a `file` object (such as the one returned in file field hooks) and an optional `options` argument for overriding S3.deleteObject options. Options `Bucket` and `Key` are set by default. For available options refer to the [AWS S3 deleteObject API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property).

```javascript
// Optional params
const deleteParams = {
  BypassGovernanceRetention: true,
};

keystone.createList('Document', {
  fields: {
    file: {
      type: File,
      adapter: fileAdapter,
      hooks: {
        beforeChange: async ({ existingItem }) => {
          if (existingItem && existingItem.file) {
            await fileAdapter.delete(existingItem.file, deleteParams);
          }
        },
      },
    },
  },
  hooks: {
    afterDelete: async ({ existingItem }) => {
      if (existingItem.file) {
        await fileAdapter.delete(existingItem.file, deleteParams);
      }
    },
  },
});
```
