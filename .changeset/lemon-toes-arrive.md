---
'@keystone-6/core': minor
'@keystone-6/website': patch
'@keystone-6/example-blog': patch
---

For relationship fields, within the Admin UI items in the select for picking the related record(s) are now ordered by default. This generally makes it easier for admins to find the required item(s). If no specific order is selected then records will be ordered by the label field defined for the relationship or the label field for the related list. In addition, new ordering options have been added so that in schema.ts you can configure a different ordering scheme or choose no ordering.

This changeset also addresses bug #6112 - ui.labelField option on Relationship field configuration not having any effect.