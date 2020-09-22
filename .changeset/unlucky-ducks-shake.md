---
"@keystonejs/keystone": major
---

Updated dependency `pluralize` to `^8.0.0`.
This may cause changes to your GraphQL schema if you have list names which are now treated differently by this library.
Check the [`pluralize` release notes](https://github.com/plurals/pluralize/releases/v8.0.0) for details.
You can override the behaviour of `pluralize` by passing in `singular` or `plural` config options to `keystone.createList()`.
