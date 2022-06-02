---
'@keystone-6/core': major
---

New support for uploading images and files to Amazon S3 and other compatible providers.
This is a *breaking change*, as the `.image` and `.files` configuration options have been removed, and a new storage configuration object introduced.

See [#7070](https://github.com/keystonejs/keystone/pull/7070) for how to upgrade.
