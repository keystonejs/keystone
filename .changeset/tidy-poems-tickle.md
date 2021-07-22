---
'@keystone-next/keystone': patch
---

Changed symlink generation to use relative path instead of absolute. Solves running project in docker when mapping volume.
