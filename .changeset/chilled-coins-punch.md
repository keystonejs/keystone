---
'@keystone-ui/popover': patch
---

Fixed Popover component to toggle open and closed on click of the trigger, previously trigger click would only open the dialog.

This is necessary because the Admin UI has limited usability on mobile phones, and when certain dialogs open, it is difficult to close by clicking outside.
This adds the option of closing it by clicking the menu button again.
