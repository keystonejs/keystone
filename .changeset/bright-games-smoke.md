---
'@keystonejs/app-admin-ui': patch
---

Implemented a workaround to show error in case of mutations errors, since an error in apollo client is preventing to show those messages with the original implementation. This time is for CreateItemModal and UpdateManyItemsModal.
