---
'@keystonejs/access-control': major
'@keystonejs/keystone': major
'@keystonejs/logger': patch
---

Added async capability for all Access Control resolvers. This changes the below methods to async functions, returning Promises:

```
access-control
- validateCustomAccessControl
- validateListAccessControl
- validateFieldAccessControl
- validateAuthAccessControl

keystone/List
- checkFieldAccess
- checkListAccess

keystone/providers/custom
- computeAccess

keystone/providers/listAuth
- checkAccess

```

Changed `keystone/Keystone`'s `getGraphQlContext` return object (context) to include async resolvers for the following methods:
```
- context.getCustomAccessControlForUser
- context.getListAccessControlForUser
- context.getFieldAccessControlForUser
- context.getAuthAccessControlForUser
```
