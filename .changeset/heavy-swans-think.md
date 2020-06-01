---
'@keystonejs/file-adapters': patch
---

* Replaced `stream.close` with `stream.destroy()` in s3 file-adapter as there is no `readableStream.close` method.
* Added documentation about using S3-compatible storage provider. Provided sample config for DigitalOcean and Minio.
