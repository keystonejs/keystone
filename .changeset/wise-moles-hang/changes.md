Add support for `access: { auth: ... }` which controls whether authentication queries and mutations are accessible on a List

If you have a `List` which is being used as the target of an Authentication Strategy, you should set `access: { auth: true }` on that list.
