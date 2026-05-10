---
"@keystone-6/core": patch
---

Fixed an issue where field-level validation messages were lost if a list-level validation hook threw an exception. Field validation messages are now prioritized and preserved in list-level hook crashes.
