---
'@keystone-6/website': minor
'@keystone-6/example-assets-cloud': minor
'@keystone-6/example-assets-local': minor
'@keystone-6/example-auth': minor
'@keystone-6/examples-app-basic': minor
'@keystone-6/example-ecommerce': minor
'@keystone-6/example-embedded-nextjs': minor
'@keystone-6/example-graphql-api-endpoint': minor
'@keystone-6/example-roles': minor
'@keystone-6/example-sandbox': minor
'@keystone-6/example-blog': minor
'@keystone-6/example-custom-admin-ui-logo': minor
'@keystone-6/example-custom-admin-ui-navigation': minor
'@keystone-6/example-custom-admin-ui-pages': minor
'@keystone-6/example-custom-field': minor
'@keystone-6/example-custom-field-view': minor
'@keystone-6/example-default-values': minor
'@keystone-6/example-document-field': minor
'@keystone-6/example-extend-graphql-schema': minor
'@keystone-6/example-extend-graphql-schema-graphql-ts': minor
'@keystone-6/example-extend-graphql-schema-nexus': minor
'@keystone-6/example-json-field': minor
'@keystone-6/example-rest-api': minor
'@keystone-6/example-task-manager': minor
'@keystone-6/example-testing': minor
'@keystone-6/example-virtual-field': minor
'@keystone-6/example-with-auth': minor
'@keystone-6/core': minor
'@keystone-6/test-projects-basic': minor
'@keystone-6/test-projects-crud-notifications': minor
'@keystone-6/test-projects-live-reloading': minor
---

Added support for Prisma SHADOW_DATABASE_URL and updated affected schemas.

Example:
```ts
config({
  // ... your prisma schema
  db: {
    shadowUrl: "postgres://dbuser:dbpass@localhost:5432/shadowdb",
  },
  // ...
}),
```
