---
'@keystonejs/list-plugins': minor
---

- Fixed bug in byTracking plugin where updatedBy field was not updated.
- Now in both of tracking plugins "updated" fields are updating only after event "updating ", and remain empty for an event "create".
