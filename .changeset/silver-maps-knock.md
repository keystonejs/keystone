---
'@keystonejs/fields': major
---

Changing File field knex.schema.jsonb() to .json() for better DB compatibility

Related Knex documentation: http://knexjs.org/#Schema-json
                            http://knexjs.org/#Schema-jsonb

Although the Knex documentation claims that `.jsonb()` works similarly to `.json()`, it does not offer backwards compatibility for databases that do not support JSONB.

`.json()` uses the built-in JSON type for PostgreSQL, MySQL and SQLite, defaulting to a text column in older versions or in unsupported databases.
