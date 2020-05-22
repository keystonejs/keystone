---
'@keystonejs/app-admin-ui': patch
---

* Disables all the field in Item detail page when `update` access is false. Earlier it would not show any fields in detail page.
* Disabled Item Detail page Footer actions based on access control.
* Also fixes a bug where `Delete` action for multiple item in the list view removed when you have delete access but no update access.
