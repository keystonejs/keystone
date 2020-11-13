---
'@keystonejs/fields': minor
'@keystonejs/fields-auto-increment': minor
'@keystonejs/fields-cloudinary-image': minor
'@keystonejs/fields-location-google': minor
'@keystonejs/fields-mongoid': minor
'@keystonejs/fields-oembed': minor
'@keystonejs/fields-unsplash': minor
---

Added a `.getBackingTypes()` method to all `Field` implementations, which returns `{ path: { optional, type } }`. This method will be used to generate typescript types in our upcoming [new interfaces](https://www.keystonejs.com/blog/roadmap-update).
