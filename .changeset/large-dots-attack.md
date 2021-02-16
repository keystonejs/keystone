---
'@keystonejs/access-control': major
'@keystonejs/keystone': patch
---

The functions `validate*AccessControl` no longer set default values for the `authentication` value. If you are calling these functions directly you will need to make sure you pass in a value for `authentication`. If you are not directly calling these functions then there are no changes required.
