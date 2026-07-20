---
"@keystone-6/core": major
---

Removes the `@keystone-ui/*` design system, you should upgrade your custom components to `@keystar/ui`. When you depend on `@keystar/ui`, you should pin `@keystar/ui` and `@keystone-6/core` to matching versions based on the version in `@keystone-6/core`'s `peerDependencies`, whenever updating `@keystone-6/core`, you should also update `@keystar/ui` to the matching version.