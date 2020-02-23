---
'@keystonejs/app-admin-ui': minor
---

Allowed use of `config` object in custom pages. This enables passing on any custom config or even a function to the custom Page component in `admin-ui`

you can now add config like this

```js
{
  label: 'About this project',
  path: 'about',
  config: {
    option: 'value',
  },
  component: About,
},
    
```
