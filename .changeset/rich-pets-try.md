---
'@keystonejs/mongo-join-builder': patch
---

Adding a new Relationship field when using the Mongoose adapter will no longer cause an "$in requires an array as a second argument, found: missing" error to be thrown.
