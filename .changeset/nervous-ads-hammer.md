---
"@keystone-next/keystone": patch
---

Pinned `@apollo/client` to 3.4.17, fixes an incompatibility between `@apollo/client` >= 3.5.0 and `apollo-upload` that breaks the Admin UI.

We can revert this when [jaydenseric/apollo-upload-client#273](https://github.com/jaydenseric/apollo-upload-client/issues/273) has been resolved (may also be resolved by [apollographql/apollo-client#9103](https://github.com/apollographql/apollo-client/pull/9103))
