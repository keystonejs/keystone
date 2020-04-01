---
'@keystonejs/adapter-knex': major
'@keystonejs/adapter-mongoose': major
'create-keystone-app': major
'@keystonejs/fields': major
---

Updated @sindresorhus/slugify to fix a problem where it was producing unexpected output, eg. adding unexpected underscores: 'NAME1 Website' => 'nam_e1_website'. The slugify output for db name may be different with this change. For the above example, the output will now be 'name_1_website' for the same string.

If your database name changes unexpectedly, add an environmental variable called `DATABASE_URL` with a full path to the database.
