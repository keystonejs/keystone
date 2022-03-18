---
'@keystone-6/core': minor
'@keystone-6/website': patch
'@keystone-6/example-blog': patch
---

For relationship fields, within the Admin UI, items in the dropdown for picking the related record(s) are now, by default, ordered. This generally makes it easier to find the required item. If no specific order is selected then records will be ordered by the label field. In addition, new ordering options have been added so that in schema.ts you can select a different ordering scheme or choose no ordering.

In addition, this changeset also addresses bug #6112 - ui.labelField option on Relationship field configuration not having any effect.