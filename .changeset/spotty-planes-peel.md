---
'@keystonejs/api-tests': patch
'@keystonejs/demo-project-blog': patch
'@keystonejs/demo-project-meetup': patch
'@arch-ui/day-picker': patch
'@keystonejs/fields': major
---

Updated the CalendarDay field to enforce `dateTo` and dateFrom` ranges. Previously `yearRangeFrom` and `yearRangeTo` were validated only on the client-side. These options have been depreciated in favour of `dateTo` and `dateFrom`. The CalendarDay field is now also enforcing stricter validation of 10 character ISO8601 date strings: `YYYY-MM-DD`.
