---
'@keystonejs/list-plugins': patch
---

Tweaked hooks and utility function.
*  Renamed `composeResolveInput` utility function to `composeHook` to indicate right use by name, this can also be used in other hook type and not just `resolveInput` hook.
* Switch to use of `operation` param to hook for detecting if this is `create` or `update` operation instead of existingItem being `undefined`.