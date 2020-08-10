---
'@keystonejs/app-admin-ui': patch
---

Added a fix to navigate when the `Label` column is hidden in list page of admin UI. 

In the list page of admin UI, the `Label` column was used to open up the detailed view of a single item.
Thus, hiding the `Label` column was preventing the user to navigate to detailed view.

This was happening because inside `ListTable`, the default value for `linkField` was set to `_label_`.
To fix this, we have now added the path of first field as default value to `linkField`.
