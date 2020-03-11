---
'@keystonejs/auth-passport': patch
---

Fixes #2362 - Passport Auth. 

Implements solution by @HackerYunen, adds Hostname for callback inside passport. 
Either this is needed, or we need to split the middleware config to add/remove this before/after route instantiation as it uses this config to 
    1.) create the callback route, and 
    2.) passes this to the provider.
