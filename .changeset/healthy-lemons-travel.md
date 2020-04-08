---
'create-keystone-app': major
---

This release adds support for specifying and testing the database connection string used when setting up a new project.
The quick-start guide has also been updated to give better instructions on to setup both MongoDB and PostgreSQL databases.

The command line API for `create keystone-app` has also changed:
 - `--adapter` has been replaced with `--database`, which accepts options of either `MongoDB` or `PostgreSQL`.
 - `--conection-string` has been added, which allows you to specify either a `mongodb://` or `postgres://` connection string.
 - `--test-connection` has been added, which will tell the installer to test the connection string before setting up the project.
