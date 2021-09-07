---
'@keystone-next/keystone': major
'@keystone-next/website': patch
'@keystone-next/examples-app-basic': patch
'keystone-next-app': patch
'@keystone-next/example-blog': patch
'@keystone-next/example-custom-admin-ui-logo': patch
'@keystone-next/example-custom-admin-ui-navigation': patch
'@keystone-next/example-custom-admin-ui-pages': patch
'@keystone-next/example-custom-field': patch
'@keystone-next/example-custom-field-view': patch
'@keystone-next/example-default-values': patch
'@keystone-next/example-document-field': patch
'@keystone-next/example-extend-graphql-schema': patch
'@keystone-next/example-json-field': patch
'@keystone-next/example-task-manager': patch
'@keystone-next/example-testing': patch
'@keystone-next/example-virtual-field': patch
'@keystone-next/example-with-auth': patch
'@keystone-next/api-tests-legacy': patch
---

Upgraded Apollo Server to [Version 3](https://www.apollographql.com/docs/apollo-server/migration/).

The Apollo documentation contains a full list of breaking changes introduced by this update.
You can configure the Apollo Server provided by Keystone using the [`graphql.apolloConfig`](https://keystonejs.com/docs/apis/config#graphql) configuration option.

The most prominant change for most users will be that the GraphQL Playground has been replaced by the Apollo Sandbox.
If you prefer to keep the GraphQL Playground, you can configure your server by [following these instructions](https://www.apollographql.com/docs/apollo-server/migration/#graphql-playground).
