---
'@keystone-ui/core': patch
---

Add .vscode to .prettierignore to prevent `yarn lint` errors on `.vscode/launch.json` file, which is in "JSON with Comments" format.
