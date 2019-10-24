---
'@keystonejs/api-tests': major
'@keystonejs/benchmarks': major
'@keystonejs/demo-project-blog': major
'@keystonejs/demo-project-meetup': major
'@keystonejs/demo-project-todo': major
'@keystonejs/access-control': major
'@keystonejs/adapter-knex': major
'@keystonejs/adapter-mongoose': major
'@keystonejs/apollo-helpers': major
'@keystonejs/app-admin-ui': major
'@keystonejs/app-graphql-playground': major
'@keystonejs/app-graphql': major
'@keystonejs/app-next': major
'@keystonejs/app-nuxt': major
'@keystonejs/app-schema-router': major
'@keystonejs/app-static': major
'@keystonejs/auth-passport': major
'@keystonejs/auth-password': major
'@keystonejs/build-field-types': major
'@keystonejs/email': major
'@keystonejs/field-content': major
'@keystonejs/field-views-loader': major
'@keystonejs/fields-auto-increment': major
'@keystonejs/fields-datetime-utc': major
'@keystonejs/fields-markdown': major
'@keystonejs/fields-mongoid': major
'@keystonejs/fields-wysiwyg-tinymce': major
'@keystonejs/fields': major
'@keystonejs/file-adapters': major
'@keystonejs/keystone': major
'@keystonejs/list-plugins': major
'@keystonejs/logger': major
'@keystonejs/mongo-join-builder': major
'@keystonejs/oembed-adapters': major
'@keystonejs/session': major
'@keystonejs/test-utils': major
'@keystonejs/utils': major
'@keystonejs/cypress-project-access-control': major
'@keystonejs/cypress-project-basic': major
'@keystonejs/cypress-project-client-validation': major
'@keystonejs/cypress-project-login': major
'@keystonejs/cypress-project-social-login': major
'@keystonejs/website': major
'@keystonejs/example-projects-blank': major
'@keystonejs/example-projects-nuxt': major
'@keystonejs/example-projects-starter': major
'@keystonejs/example-projects-todo': major
'create-keystone-app': minor
---

Release @keystonejs/* packages (つ＾◡＾)つ

- This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
- All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
- To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.
