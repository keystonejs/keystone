---
'@keystone-6/fields-document': major
---

The config for relationships in props on component blocks in the document field has moved so that it's configured at the relationship prop rather than in the `relationships` key on the document field config. The `relationships` key in the document field config now exclusively refers to inline relationships.
