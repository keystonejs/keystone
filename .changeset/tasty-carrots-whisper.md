---
'@arch-ui/confirm': patch
'@arch-ui/dialog': patch
'@arch-ui/drawer': patch
'@arch-ui/popout': patch
---

Made usages of `document.body` conditional so that the component doesn't immediately fail on the server
