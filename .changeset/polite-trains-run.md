---
'@keystonejs/demo-project-blog': major
'@keystonejs/demo-project-meetup': major
'@arch-ui/day-picker': major
'@keystonejs/fields': major
'@keystonejs/fields-datetime-utc': major
'@keystonejs/list-plugins': major
'@keystonejs/cypress-project-basic': major
'@keystonejs/cypress-project-client-validation': major
---

Upgraded to date-fns 2.x. This version uses [Unicode tokens](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table) for its formatting strings. A conversion table is available [here](https://github.com/date-fns/date-fns/blob/master/CHANGELOG.md#200---2019-08-20).

This change only affects the `CalendarDay` and `DateTime` fields' `format` config option.

The following script utilizes the [`@date-fns/upgrade`](https://github.com/date-fns/date-fns-upgrade) package and can be used to convert old formatting strings:

```js
const { convertTokens } = require('@date-fns/upgrade/v2');

console.table(
  [
    // Add date-dns 1.x formatting strings here.
  ].map(str => ({
    v1: str,
    v2: convertTokens(str).replace(/'/g, ''),
  }))
);
```

Do note this converts symbols to standalone style as opposed to formatted style which may not always be desired. For example, `DD/MM/YYYY` would be converted to `dd/LL/yyyy` instead of `dd/MM/yyyy`. See [here](http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Stand-Alone-vs.-Format-Styles) for more information on which you should use.
