---
'@arch-ui/day-picker': patch
'@keystonejs/fields': patch
---

Fixed many usability issues with the CalendarDay field:
- Fixed field not functioning as a proper controlled component in the Create popout.
- Fixed field initially displaying "Invalid Date" before defaulting to 1970-01-01.
- Filter input no longer defaults to the current date. This was bugged; submitting the form with no changes would match nothing.
- Filter input now falls back to no value when given an invalid date. Previously, it was falling back to 1970-01-01.
- Fixed filter input not initially displaying the current value when in edit mode (it was displaying the current date).
- Fixed filter input not being initially focused.
- Fixed filter input not being submitted properly if focus wasn't lost first.

Updated chrono-node dependency to 1.4.6.