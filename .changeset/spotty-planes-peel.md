---
'@keystonejs/api-tests': patch
'@keystonejs/demo-project-blog': patch
'@keystonejs/demo-project-meetup': patch
'@arch-ui/day-picker': patch
'@keystonejs/fields': major
---

The `CalendarDay` field type options `yearRangeFrom` and `yearRangeTo` have been removed, and replaced with `dateFrom` and `dateTo`. These options take an ISO8601 formatted date string in the form `YYYY-MM-DD`, e.g. `2020-06-30`. These values are now validated on the server-side, rather than just on the client-side within the Admin UI.

If you are currently using `yearRangeFrom` or `yearRangeTo` you will need to make the following change:

```
birthday: { type: CalendarDay, yearRangeFrom: 1900, yearRangeTo: 2100 }
```
becomes

```
birthday: { type: CalendarDay, dateFrom: '1900-01-01', dateTo: '2100-12-31' }
```