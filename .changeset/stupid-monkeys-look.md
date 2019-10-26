---
'@keystonejs/adapter-mongoose': patch
---

Adding a new Relationship field when using the Mongoose adapter will no longer
cause an "\$in needs an array"  error to be thrown.
