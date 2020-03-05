---
'@keystonejs/app-admin-ui': patch
---

While submitting a create list form inside Admin-UI, **null** was `explicit` in the `mutation` request for blank unedited fields. 
This was preventing the knex DB-level default to be applied correctly. 

But omitting the blank (unchanged) and required fields, we managed to completely exclude it while making graphql mutation request, and thus respecting the knew `defaultTo` option.
