---
'@keystone-next/types': patch
---

Fixed `lists` and `db.lists` APIs on `KeystoneContext` to have improved types. If you're using the generated `KeystoneListsTypeInfo` type like this:

```ts
const lists: KeystoneListsAPI<KeystoneListsTypeInfo> = context.lists;
```

You will have to change it to use `as` like this:

```ts
const lists = context.lists as KeystoneListsAPI<KeystoneListsTypeInfo>;
```
