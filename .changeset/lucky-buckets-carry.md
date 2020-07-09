---
'@keystonejs/fields': patch
---

Allow passing in the `null` value to the **CalendarDay**[https://www.keystonejs.com/keystonejs/fields/src/types/calendar-day/#calendarday] field type.

Passing in the `null` value for **CalendarDay** field was throwing a `TypeError` inside the inputValidation method of CalendarDar.
This fix allow passing the null value.
