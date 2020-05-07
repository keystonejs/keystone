---
'@keystonejs/app-admin-ui': patch
---

Fixed reading of `AnimateHeight` node height which because of the rounding-down nature of `scrollHeight` property value could sometimes cause scrollbar to be present in the filter popout.

Provided correct value for `AnimateHeight` css transition property's disabled state.
