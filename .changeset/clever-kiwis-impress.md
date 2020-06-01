---
'@keystonejs/app-admin-ui': minor
---

Enable use of ui hooks for specific List page.

```js
module.exports = {
    // other hooks
    itemHeaderActions: ActionsForAllPage,
    itemHeaderPostActions: ActionsForPostPageOnly,
    listHeaderUserActions: ActionsForUserPageOnly,
    listManageUserActions: ActionsForUserPageOnly,
    listItemUserActions: ActionsForUserPageOnly,
}
```
