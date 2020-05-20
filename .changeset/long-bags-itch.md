---
'@keystonejs/file-adapters': major
---

Providing an access key, secret access key or region directly to AWS has been deprecated (according to AWS). As such, parameters `accessKeyId`, `secretAccessKey` and `region` are no longer `required` on the S3Adapter's constructor and - if provided this way - are ignored by the S3Adapter. These parameters can however, still be provided via the optional `s3Options` parameter object if required like so:

``` Javascript
const fileAdapter = new S3Adapter({
  bucket: 'bucket-name',
  // accessKeyId: 'ACCESS_KEY_ID', // No longer required. Ignored if provided here
  // secretAccessKey: 'SECRET_ACCESS_KEY', // No longer required. Ignored if provided here
  // region: 'us-west-2' // No longer required. Ignored if provided here
  s3Options: {
    accessKeyId: 'ACCESS_KEY_ID',
    secretAccessKey: 'SECRET_ACCESS_KEY',
    region: 'us-west-2',
  }
});
```
