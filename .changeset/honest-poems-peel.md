---
'@keystone/api-tests': major
'@keystone/benchmarks': major
'@keystone/demo-project-blog': major
'@keystone/demo-project-meetup': major
'@keystone/demo-project-todo': major
'@keystone/access-control': major
'@keystone/adapter-knex': major
'@keystone/adapter-mongoose': major
'@keystone/apollo-helpers': major
'@keystone/app-admin-ui': major
'@keystone/app-graphql-playground': major
'@keystone/app-graphql': major
'@keystone/app-next': major
'@keystone/app-nuxt': major
'@keystone/app-schema-router': major
'@keystone/app-static': major
'@keystone/auth-passport': major
'@keystone/auth-password': major
'@keystone/build-field-types': major
'@keystone/email': major
'@keystone/field-content': major
'@keystone/field-views-loader': major
'@keystone/fields-auto-increment': major
'@keystone/fields-datetime-utc': major
'@keystone/fields-markdown': major
'@keystone/fields-mongoid': major
'@keystone/fields-wysiwyg-tinymce': major
'@keystone/fields': major
'@keystone/file-adapters': major
'@keystone/keystone': major
'@keystone/list-plugins': major
'@keystone/logger': major
'@keystone/mongo-join-builder': major
'@keystone/oembed-adapters': major
'@keystone/session': major
'@keystone/test-utils': major
'@keystone/utils': major
'@keystone/cypress-project-access-control': major
'@keystone/cypress-project-basic': major
'@keystone/cypress-project-client-validation': major
'@keystone/cypress-project-login': major
'@keystone/cypress-project-social-login': major
'@keystone/website': major
'@keystone/example-projects-blank': major
'@keystone/example-projects-nuxt': major
'@keystone/example-projects-starter': major
'@keystone/example-projects-todo': major
'create-keystone-app': minor
---

- This is the first release of `@keystone/*` packages (previously `@keystone-alpha/*`).
- All packages in the `@keystone-alpha` namespace are now available in the `@keystone` namespace, starting at version `5.0.0`.
- To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystone/*": "^5.0.0"` and update any `require`/`import` statements in your code.
