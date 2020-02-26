---
'@keystonejs/app-admin-ui': minor
---

Made internal changes to allow separate key for persisted list ui state (search/filter/column etc.) when composing custom pages using admin-ui components.

when you compose using `List` component, you can now add `listView='some string'` to separate config from one rendering to another.
