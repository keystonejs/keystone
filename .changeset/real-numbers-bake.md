---
"@keystone-6/core": major
"@keystone-6/website": patch
---

Make the navigation wrapping ul component user customisable

The `NavigationContainer` component rendered it's children inside a `ul` meaning if you wanted to render anything other than an `li` you would have to do some gymnastics to make it work. This change makes it the users' responsibility to properly wrap list items in a `ul`.