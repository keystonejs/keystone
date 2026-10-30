---
"@keystone-6/core": major
"@keystone-6/cloudinary": patch
---

Removes `g.Upload`. Custom fields using `g.Upload` must now import the scalar from `graphql-upload/GraphQLUpload.js`
