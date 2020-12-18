---
'@keystonejs/demo-project-blog': patch
'@keystonejs/demo-project-meetup': patch
'@keystonejs/example-projects-starter': patch
---

Updated `protectIdenties` from the default `false` to `process.env.NODE_ENV === 'production'`, to provide a better balance of protection and convenience.
