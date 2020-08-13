---
'@keystonejs/file-adapters': patch
---

Fixed S3 adapter issue on windows where the wrong path character was being used due to `path.join`
