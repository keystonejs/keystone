---
'@keystone-6/core': patch
---

Fixed the Admin UI crashing when saving an item with a relationship field using the cards display mode when another item is added to the relationship (e.g. by another user or a hook) since the item was initially loaded
