---
'@keystone-6/fields-document': patch
---

When new fields are added to an object field in a component block, the GraphQL will no longer error when returning data where some fields are missing in the saved data and the Admin UI will add the missing fields when a item is opened. Note that the missing fields won't be automatically added when fetched from the GraphQL, you will still have to handle the field being missing when consuming the data from the GraphQL API.
