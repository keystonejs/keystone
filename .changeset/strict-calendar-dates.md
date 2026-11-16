---
'@keystone-6/core': patch
---

Fixes `DateTime` and `CalendarDay` GraphQL scalars accepting impossible dates like `2021-02-30`, which were silently saved as a different date (e.g. `2021-03-02`)
