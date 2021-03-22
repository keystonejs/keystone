---
'@keystone-next/fields': minor
---

Added BigInt database field type with String representation in JS
JavaScript and GraphQL have bad support for BigInt, so we store
real BigInt values only in database, but represent them as strings
in JavaScript ang GraphQL schemas.

More info about BigInt support:

- in GrapQL https://github.com/graphql/graphql-js/issues/2017
- in JSON https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
