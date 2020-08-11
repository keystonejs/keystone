---
'@keystonejs/demo-project-meetup': patch
---

**Fixed the `CloudinaryImage` field import in meetup demo**

The `CloudinaryImage` was wrongly imported from `@keystonejs/fields` package causing an invalid type error. 

This change imports it correctly from `@keystonejs/fields-cloudinary-image`.
