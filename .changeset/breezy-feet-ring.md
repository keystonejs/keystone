---
'@keystonejs/keystone': patch
---

Removed `addFieldValidationError` from the args passed to list validation hooks, as it was unused and could lead to confusion. Updated docs to clarify the validation hook arguments. Thanks @pahaz for the fix.
