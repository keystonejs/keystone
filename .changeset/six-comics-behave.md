---
'@keystonejs/fields': patch
---

Some minor cleanup to the file field:

- Removed unused `route` and `directory` config options.
- Added `originalFilename` to the admin meta query.
- Explicitly added `originalFilename` and `encoding` to the Mongoose schema.
