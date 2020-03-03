---
'@keystonejs/app-admin-ui': minor
---

Added more entry points for UI Hooks in admin ui. Similar to `itemHeaderActions`.

- `listHeaderActions` - this adds button in place of `Create` item button on list page.
- `listManageActions` - this adds button in place of multi select update on list page (Update Many and Delete Many).
- `listItemActions` - this adds dropdown buttons for each item in list. caveat: you have to recreate the DropDown component, can be copied from the source.
