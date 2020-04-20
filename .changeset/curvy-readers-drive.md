---
'@arch-ui/fields': patch
'@keystonejs/fields-markdown': patch
'@keystonejs/fields-mongoid': patch
---

Cleaned up FieldDescription usage. The `<FieldDescription>` component no longer accepts children and requires a `text` prop:

`<FieldDescription>Hello World</FieldDescription>` => `<FieldDescription text="Hello World" />`
