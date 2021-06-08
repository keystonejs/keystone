---
'@keystone-next/keystone': major
'@keystone-next/types': major
---

List level create, update and delete access control is now called for each operation in a many operation rather than on all of the operations as a whole. This means that rather than recieving originalInput as an array with itemIds, your access control functions will always be called with just an itemId and/or originalInput(depending on which access control function it is). If your access control functions already worked with creating/updating/deleting one item, they will continue working (though you may get TypeScript errors if you were previously handling itemIds and originalInput as an array, to fix that, you should stop handling that case).
