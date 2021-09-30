---
'@keystone-next/keystone': major
---

In the `password` field, `defaultValue` has been removed, `isRequired` has moved to `validation.isRequired`, `rejectCommon` has moved to `validation.rejectCommon`, `minLength` has moved to `validation.length.min` along with with the new `validation.length.max` and `validation.match` options. The `password` field can also be made non-nullable at the database-level with the `isNullable` option which defaults to `true`. Also, providing `''` to the field will now result in an error instead of silently setting null. `validation.length.min` also must be `1` or above, though it still defaults to `8`. If `workFactor` is outside of the range of `6` to `31`, an error will now be thrown instead of the previous behaviour of clamping the value to `4` to `31` and warning if it's below `6`.

