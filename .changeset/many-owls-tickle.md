---
'@keystonejs/fields': patch
'@keystonejs/fields-auto-increment': patch
'@keystonejs/fields-cloudinary-image': patch
'@keystonejs/fields-color': patch
'@keystonejs/fields-location-google': patch
'@keystonejs/fields-markdown': patch
'@keystonejs/fields-mongoid': patch
'@keystonejs/fields-oembed': patch
'@keystonejs/fields-unsplash': patch
'@keystonejs/fields-wysiwyg-tinymce': patch
'@keystonejs/api-tests': patch
---

Consolidated filter tests across all field types.
Fixed errors with filtering by `null` in the `Decimal`, `MongoId` and `Uuid` field types.
