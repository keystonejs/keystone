---
'@keystonejs/app-admin-ui': minor
'@keystonejs/fields': minor
---

Added adminIsReadOnly property to field config, which makes fields with this property appear in the same manner as Cell view even INSIDE Item Details page, so the field value can't be (e.g. accidentally) changed from admin UI.
