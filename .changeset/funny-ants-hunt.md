---
'@keystonejs/adapter-mongoose': patch
'@keystonejs/fields-location-google': patch
'@keystonejs/fields': patch
---

Restricted `mongoose` to the version range `~5.9.11` to avoid a [bug](https://github.com/keystonejs/keystone/issues/3397) in `5.10.0`.
