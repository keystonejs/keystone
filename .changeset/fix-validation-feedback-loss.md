---
"@keystone-6/core": patch
---

Fixed an issue where field-level validation messages were lost if a list-level validation hook threw an exception. Field validation messages are now prioritized and preserved even during list-level hook crashes. Also updated hook error tags and documentation to use the correct `validate` name to match the public API.
