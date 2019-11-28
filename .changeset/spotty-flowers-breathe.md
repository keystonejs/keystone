---
'@arch-ui/day-picker': patch
'@keystonejs/fields': patch
---

Fixed several issues with the CalendarDay field:
- Ensured format, yearRangeFrom, and yearRangeTo defaults are set correctly
- Removed non-functional yearPickerType
- Made displayed date format consistent between list and detailed views
- Moved date range validation to validateInput
