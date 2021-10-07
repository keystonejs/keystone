---
'@keystone-next/keystone': patch
---

Keystone will now consistently not respect a custom Babel config if it exists rather than the previous behaviour of respecting it in some commands but not for compilations from `keystone-next build` that are run with `keystone-next start`
